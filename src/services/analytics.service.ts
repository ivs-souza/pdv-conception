import { db } from '@/utils/firebase'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  orderBy,
  onSnapshot
} from 'firebase/firestore'

/**
 * Sapphire v2.0 - AnalyticsService
 * Business Intelligence engine for SaaS performance oversight.
 */
export const AnalyticsService = {
  /**
   * Fetches the last 5 sales for the Activity Feed.
   */
  subscribeToRecentSales(callback: (sales: any[]) => void) {
    if (!db) {
       console.warn("Firestore not configured. Recent sales subscription skipped.")
       return () => {}
    }
    const q = query(collection(db, "vendas"), orderBy("createdAt", "desc"), limit(5))
    return onSnapshot(q, (snapshot: any) => {
      const sales = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      callback(sales)
    })
  },

  /**
   * Aggregates financial totals for a specific period.
   * Logic: Optimized for v2.0 client-side aggregation.
   */
  async getQuickStats(period: 'TODAY' | 'WEEK' | 'MONTH' = 'MONTH') {
    const zeroState = {
      totalFaturamento: 0,
      totalLucro: 0,
      ticketMedio: 0,
      lowStockCount: 0,
      vendasCount: 0,
      topCategory: '---',
      weeklyPerformance: [0, 0, 0, 0, 0, 0, 0],
      categoryRanking: [] as any[],
      byMethod: { DINHEIRO: 0, ELECTRONIC: 0, FIADO: 0 }
    }

    if (!db) return zeroState
    try {
      const salesSnap = await getDocs(collection(db, "vendas"))
      const productsSnap = await getDocs(collection(db, "produtos"))
      
      const products = productsSnap.docs.map((d: any) => d.data())
      
      // Filter sales by date
      const now = new Date()
      const filterDate = new Date()
      if (period === 'TODAY') filterDate.setHours(0,0,0,0)
      if (period === 'WEEK') filterDate.setDate(now.getDate() - 7)
      if (period === 'MONTH') filterDate.setDate(now.getDate() - 30)

      const sales = salesSnap.docs
        .map((d: any) => ({ id: d.id, ...d.data() }))
        .filter((s: any) => s.createdAt && s.createdAt.toDate() >= filterDate)

      const totalFaturamento = sales.reduce((acc: number, s: any) => acc + (s.total || 0), 0)
      const totalLucro = sales.reduce((acc: number, s: any) => acc + (s.estimatedProfit || 0), 0)
      
      // BI: Calculate Champion Category (v3.1)
      const categoryVolume: any = {}
      sales.forEach((sale: any) => {
        (sale.items || []).forEach((item: any) => {
          const cat = item.category || 'Outros'
          const itemTotal = (item.salePrice ?? item.precoVenda ?? item.price ?? 0) * (item.qty || 1)
          categoryVolume[cat] = (categoryVolume[cat] || 0) + itemTotal
        })
      })

      let topCategory = '---'
      let maxVolume = 0
      Object.entries(categoryVolume).forEach(([cat, vol]: [string, any]) => {
        if (vol > maxVolume) {
          maxVolume = vol
          topCategory = cat
        }
      })

      // BI: Weekly Performance Tracking (Last 7 Days)
      const weeklyPerf = [0, 0, 0, 0, 0, 0, 0]
      const last7Days = new Date()
      last7Days.setDate(now.getDate() - 6)
      last7Days.setHours(0,0,0,0)

      salesSnap.docs.forEach((d: any) => {
        const data = d.data()
        if (data.createdAt) {
          const saleDate = data.createdAt.toDate()
          if (saleDate >= last7Days) {
            const dayDiff = Math.floor((saleDate.getTime() - last7Days.getTime()) / (1000 * 60 * 60 * 24))
            if (dayDiff >= 0 && dayDiff < 7) {
              weeklyPerf[dayDiff] += (data.total || 0)
            }
          }
        }
      })

      // BI: Category Ranking for selected period
      const categoryRanking = Object.entries(categoryVolume)
        .map(([label, amount]: [string, any]) => ({
          label,
          amount,
          percentage: totalFaturamento > 0 ? (amount / totalFaturamento) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 4)

      // Group by payment method
      const constByMethod: any = {
        DINHEIRO: sales.filter((s: any) => s.paymentMethod === 'DINHEIRO').reduce((acc: number, s: any) => acc + (s.total - (s.changeAmount || 0)), 0),
        ELECTRONIC: sales.filter((s: any) => ['PIX', 'CREDITO', 'DEBITO', 'CARTÃO'].includes(s.paymentMethod)).reduce((acc: number, s: any) => acc + (s.total || 0), 0),
        FIADO: sales.filter((s: any) => s.paymentMethod === 'FIADO').reduce((acc: number, s: any) => acc + (s.total || 0), 0)
      }

      return {
        totalFaturamento,
        totalLucro,
        ticketMedio: sales.length > 0 ? totalFaturamento / sales.length : 0,
        lowStockCount: products.filter((p: any) => p.currentStock <= (p.minStock || 0)).length,
        vendasCount: sales.length,
        topCategory,
        weeklyPerformance: weeklyPerf,
        categoryRanking,
        byMethod: constByMethod
      }
    } catch (e) {
      console.error("Analytics Error:", e)
      return zeroState
    }
  },

  /**
   * Fetches Top 3 Debtors based on monetary value.
   */
  async getTopDebtors() {
    if (!db) return []
    try {
      const q = query(
        collection(db, "clientes"), 
        where("totalDebt", ">", 0),
        orderBy("totalDebt", "desc"), 
        limit(3)
      )
      const snap = await getDocs(q)
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error("error fetching debtors:", e)
      return []
    }
  }
}
