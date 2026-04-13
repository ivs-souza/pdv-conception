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
 * PDV Conception v2.0 - AnalyticsService
 * Business Intelligence engine for SaaS performance oversight.
 */
export const AnalyticsService = {
  /**
   * Fetches the last 5 sales for the Activity Feed.
   */
  subscribeToRecentSales(callback: (sales: any[]) => void) {
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
      
      // Group by payment method
      constByMethod: any = {
        DINHEIRO: sales.filter((s: any) => s.paymentMethod === 'DINHEIRO').reduce((acc: number, s: any) => acc + (s.total - (s.changeAmount || 0)), 0),
        ELECTRONIC: sales.filter((s: any) => ['PIX', 'CREDITO', 'DEBITO'].includes(s.paymentMethod)).reduce((acc: number, s: any) => acc + (s.total || 0), 0),
        FIADO: sales.filter((s: any) => s.paymentMethod === 'FIADO').reduce((acc: number, s: any) => acc + (s.total || 0), 0)
      }

      return {
        totalFaturamento,
        totalLucro,
        ticketMedio: sales.length > 0 ? totalFaturamento / sales.length : 0,
        lowStockCount: products.filter(p => p.currentStock <= (p.minStock || 0)).length,
        vendasCount: sales.length,
        byMethod: constByMethod
      }
    } catch (e) {
      console.error("Analytics Error:", e)
      return null
    }
  },

  /**
   * Fetches Top 3 Debtors based on monetary value.
   */
  async getTopDebtors() {
    try {
      const q = query(collection(db, "clientes"), orderBy("totalDebt", "desc"), limit(3))
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error("error fetching debtors:", e)
      return []
    }
  }
}
