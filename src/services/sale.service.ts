import { db } from '@/utils/firebase'
import { collection, addDoc, serverTimestamp, writeBatch, doc, increment, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore'
import { SettingsService } from './settings.service'

/**
 * Sapphire v3.5 - SaleService
 * Logic: Handles sale registration, transactional stock decrement, and Fiado tracking.
 */
export const SaleService = {
  /**
   * Registers a new sale with transactional inventory sync.
   */
  async registerSale(
    items: any[], 
    total: number, 
    clientId: string | null = null, 
    clientName: string | null = null,
    paymentInfo: any,
    unidade: string
  ) {
    if (!db) throw new Error("Database not connected")
    if (!unidade) throw new Error("Unidade não informada")
    
    const batch = writeBatch(db)
    const saleRef = doc(collection(db, "vendas"))
    
    try {
      // 1. Financial Context Calculation
      const settings = await SettingsService.getSettings(unidade)
      const feePercentage = Number(settings.fees?.[paymentInfo.method] || 0)
      const totalSafe = Number(total || 0)
      const totalFeeCharged = totalSafe * (feePercentage / 100)
      
      const localizedItems = items.map(item => ({
        ...item,
        costAtSale: Number(item.costPrice || 0),
        qty: Number(item.qty || 1),
        category: item.category || 'Outros',
        priceAtSale: Number(item.precoVenda ?? item.preco_venda ?? item.salePrice ?? item.price ?? 0)
      }))

      const totalCosts = localizedItems.reduce((acc: number, item: any) => acc + (item.costAtSale * item.qty), 0)
      const estimatedProfit = (totalSafe - totalFeeCharged) - totalCosts

      // 2. Main Sale Payload
      const salePayload = {
        items: localizedItems,
        total: totalSafe,
        clientId: clientId || null,
        clientName: clientName || null,
        paymentMethod: paymentInfo.method || 'DESCONHECIDO',
        receivedAmount: Number(paymentInfo.received || 0),
        changeAmount: Number(paymentInfo.change || 0),
        notes: paymentInfo.notes || '',
        status: paymentInfo.method === 'FIADO' ? 'UNPAID' : 'COMPLETED',
        createdAt: serverTimestamp(),
        dateIso: new Date().toISOString(),
        currency: 'BRL',
        feeCharged: isNaN(totalFeeCharged) ? 0 : totalFeeCharged,
        feePercentage: isNaN(feePercentage) ? 0 : feePercentage,
        estimatedProfit: isNaN(estimatedProfit) ? 0 : estimatedProfit,
        unidade, // Isolated Unit
        source: 'Sapphire v3.5 Professional'
      }

      batch.set(saleRef, salePayload)

      // 3. Stock Decrement Engine (Transactional Performance)
      localizedItems.forEach(item => {
        if (item.id) {
          const productDoc = doc(db, "produtos", item.id)
          batch.update(productDoc, {
            currentStock: increment(-item.qty),
            updatedAt: serverTimestamp()
          })
        }
      })

      // 4. CRM & Receivables Update Engine
      if (clientId) {
         const customerRef = doc(db, "clientes", clientId)
         const customerUpdatePayload: any = {
            totalSpent: increment(totalSafe),
            lastPurchase: serverTimestamp(),
            ordersCount: increment(1),
            updatedAt: serverTimestamp()
         }
         
         console.log('CRM: Atualizando métricas do cliente:', clientId, customerUpdatePayload)
         
         // If Fiado, also increment totalDebt
         if (paymentInfo.method === 'FIADO') {
            customerUpdatePayload.totalDebt = increment(totalSafe)
         }

         batch.update(customerRef, customerUpdatePayload)

         // Fiado Installments Generation
         if (paymentInfo.method === 'FIADO') {
            const installments = paymentInfo.installments || 1
            const entrance = Number(paymentInfo.entrance || 0)
            const amountToPay = totalSafe - entrance
            const installmentValue = amountToPay / installments
            
            for (let i = 0; i < installments; i++) {
               const installmentRef = doc(collection(db, "contas_a_receber"))
               // Fix: Parse YYYY-MM-DD as LOCAL date (not UTC) to avoid timezone shift
               let dueDate: Date
               if (paymentInfo.firstDueDate) {
                 const [year, month, day] = paymentInfo.firstDueDate.split('-').map(Number)
                 dueDate = new Date(year, month - 1, day) // Local date constructor
               } else {
                 dueDate = new Date()
               }
               dueDate.setMonth(dueDate.getMonth() + i)

               batch.set(installmentRef, {
                 saleId: saleRef.id,
                 clientId,
                 clientName,
                 unidade, // Isolated Unit
                 installmentNumber: i + 1,
                 totalInstallments: installments,
                 value: installmentValue,
                 dueDate: dueDate.toISOString(),
                 status: 'PENDING',
                 createdAt: serverTimestamp()
               })
            }
         }
      }

      await batch.commit()
      return { id: saleRef.id, ...paymentInfo, estimatedProfit }
      
    } catch (e: any) {
      console.error("🔥 Critical Sale Failure:", e)
      throw e
    }
  },

  /**
   * Fetches paginated sales history with advanced filtering.
   */
  async getSalesHistory(
    unidade: string,
    lastDocNode: any = null, 
    pageSize: number = 10, 
    filters?: { startDate?: Date, endDate?: Date, paymentMethod?: string, clientName?: string }
  ) {
    if (!db) return { data: [], lastDoc: null }
    if (!unidade) throw new Error("Unidade não informada")

    try {
      let conditions: any[] = [where("unidade", "==", unidade)]

      if (filters?.startDate) {
        conditions.push(where("createdAt", ">=", filters.startDate))
      }
      if (filters?.endDate) {
        // Fix for precise end of day inclusive search
        const end = new Date(filters.endDate)
        end.setHours(23, 59, 59, 999)
        conditions.push(where("createdAt", "<=", end))
      }
      if (filters?.paymentMethod && filters.paymentMethod !== 'ALL') {
        conditions.push(where("paymentMethod", "==", filters.paymentMethod))
      }

      // We cannot do 'LIKE' queries effectively in Firestore for clientName directly combined with range queries 
      // without composite indexes or client-side filtering. 
      // For now we will do client-side filtering for names, or rely on exact match if preferred.
      // A standard scalable approach is to orderBy createdAt, then filter clientName in JS.

      conditions.push(orderBy("createdAt", "desc"))

      if (lastDocNode) {
        conditions.push(startAfter(lastDocNode))
      }
      
      conditions.push(limit(pageSize))

      const q = query(collection(db, "vendas"), ...conditions)
      const snapshot = await getDocs(q)
      
      let results = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }))
      
      // Client-side text filter for name (Firestore limitation bypass for simple searches)
      if (filters?.clientName) {
         const term = filters.clientName.toLowerCase()
         results = results.filter((s: any) => s.clientName?.toLowerCase().includes(term))
      }

      const lastVisible = snapshot.docs[snapshot.docs.length - 1]

      return {
        data: results,
        lastDoc: lastVisible || null
      }
    } catch (e) {
      console.error("Error fetching sales history:", e)
      return { data: [], lastDoc: null }
    }
  },

  /**
   * Retroactive CRM Synchronization Tool
   * Scans all past sales and resets customer totalSpent, lastPurchase, and ordersCount.
   */
  async syncCrmMetrics(unidade: string) {
    // 1. Fetch ALL clients to find legacy data (no unit field)
    const allClientsSnap = await getDocs(collection(db, "clientes"))
    let legacyCounter = 0
    let migrationBatch = writeBatch(db)
    
    for (const docSnap of allClientsSnap.docs) {
       const client = docSnap.data()
       if (!client.unidade) {
          migrationBatch.update(docSnap.ref, { unidade: 'Amora Amora' })
          legacyCounter++
          
          if (legacyCounter % 400 === 0) {
             await migrationBatch.commit()
             migrationBatch = writeBatch(db)
          }
       }
    }
    
    if (legacyCounter % 400 !== 0) {
       await migrationBatch.commit()
    }
    
    if (legacyCounter > 0) {
       console.log(`📦 Migration: ${legacyCounter} legacy clients recovered.`)
    }

    // 2. Standard Sync for the specific unit
    const q = query(collection(db, "vendas"), where("unidade", "==", unidade))
    const salesSnap = await getDocs(q)
     const metricsByClient = new Map<string, { spent: number, count: number, lastDate: Date }>()

     salesSnap.forEach((d: any) => {
        const sale = d.data()
        if (sale.clientId) {
           const existing = metricsByClient.get(sale.clientId) || { spent: 0, count: 0, lastDate: new Date(0) }
           
           const saleDate = sale.createdAt?.toDate ? sale.createdAt.toDate() : new Date()
           const saleTotal = sale.total || 0

           metricsByClient.set(sale.clientId, {
              spent: existing.spent + saleTotal,
              count: existing.count + 1,
              lastDate: saleDate > existing.lastDate ? saleDate : existing.lastDate
           })
        }
     })

     let batch = writeBatch(db)
     let counter = 0

     for (const [clientId, metrics] of Array.from(metricsByClient.entries())) {
        const customerRef = doc(db, "clientes", clientId)
        batch.update(customerRef, {
           totalSpent: metrics.spent,
           ordersCount: metrics.count,
           lastPurchase: metrics.lastDate,
           updatedAt: serverTimestamp()
        })

        counter++
        if (counter % 400 === 0) {
           await batch.commit()
           batch = writeBatch(db)
        }
     }
     
     if (counter % 400 !== 0) {
        await batch.commit()
     }

     return counter
  },

  /**
   * Sale Category Reconciliation Tool
   * Scans all past sales, looks up the current product category, and updates the sale record.
   */
  async syncSaleCategories(unidade: string) {
    if (!db) throw new Error("Database not connected")
    if (!unidade) throw new Error("Unidade não informada")
    
    // 1. Map all current product categories by ID
    const productQ = query(collection(db, "produtos"), where("unidade", "==", unidade))
    const productSnap = await getDocs(productQ)
    const productCategoryMap = new Map<string, string>()
    productSnap.forEach((d: any) => {
       const p = d.data()
       if (p.category) productCategoryMap.set(d.id, p.category)
    })

    // 2. Fetch all sales
    const salesQ = query(collection(db, "vendas"), where("unidade", "==", unidade))
    const salesSnap = await getDocs(salesQ)
    let batch = writeBatch(db)
    let counter = 0

    for (const saleDoc of salesSnap.docs) {
       const sale = saleDoc.data()
       let needsUpdate = false
       const updatedItems = (sale.items || []).map((item: any) => {
          const currentCategory = productCategoryMap.get(item.id)
          if (currentCategory && item.category !== currentCategory) {
             needsUpdate = true
             return { ...item, category: currentCategory }
          }
          return item
       })

       if (needsUpdate) {
          batch.update(saleDoc.ref, { items: updatedItems, updatedAt: serverTimestamp() })
          counter++
          
          if (counter % 400 === 0) {
             await batch.commit()
             batch = writeBatch(db)
          }
       }
    }

    if (counter % 400 !== 0) {
       await batch.commit()
    }

    return counter
  },

  /**
   * EMERGENCY RESCUE SCRIPT
   * Recovers all documents missing the 'unidade' field and stamps them with 'Amora Amora'.
   */
  async rescueLegacyData() {
    if (!db) throw new Error("Database not connected")
    
    const collectionsToRescue = ["clientes", "vendas", "produtos", "caixas", "contas_a_receber", "fluxo_de_caixa"]
    let totalRescued = 0

    console.log("🛠️ Início da Intervenção Direta: Vinculando registros à 'Amora Amora'...")

    for (const collName of collectionsToRescue) {
      const snap = await getDocs(collection(db, collName))
      let batch = writeBatch(db)
      let collCounter = 0

      for (const docSnap of snap.docs) {
        const data = docSnap.data()
        // Force update if unit is missing OR empty
        if (!data.unidade || data.unidade === "") {
          batch.update(docSnap.ref, { unidade: 'Amora Amora' })
          collCounter++
          totalRescued++

          if (totalRescued % 400 === 0) {
            await batch.commit()
            batch = writeBatch(db)
          }
        }
      }

      if (collCounter > 0) {
        await batch.commit()
        console.log(`💎 [${collName}] -> ${collCounter} registros carimbados.`)
      }
    }

    console.log(`✅ Sincronização concluída! Total de ${totalRescued} documentos recuperados para Amora Amora.`)
    return totalRescued
  }
}
