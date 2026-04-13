import { db } from '@/utils/firebase'
import { collection, addDoc, serverTimestamp, writeBatch, doc, increment } from 'firebase/firestore'
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
    paymentInfo: any
  ) {
    if (!db) throw new Error("Database not connected")
    
    const batch = writeBatch(db)
    const saleRef = doc(collection(db, "vendas"))
    
    try {
      // 1. Financial Context Calculation
      const settings = await SettingsService.getSettings()
      const feePercentage = Number(settings.fees?.[paymentInfo.method] || 0)
      const totalSafe = Number(total || 0)
      const totalFeeCharged = totalSafe * (feePercentage / 100)
      
      const localizedItems = items.map(item => ({
        ...item,
        costAtSale: Number(item.costPrice || 0),
        qty: Number(item.qty || 1),
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

      // 4. Receivables Track (Fiado Logic v3.5)
      if (paymentInfo.method === 'FIADO' && clientId) {
        const installments = paymentInfo.installments || 1
        const entrance = Number(paymentInfo.entrance || 0)
        const amountToPay = totalSafe - entrance
        const installmentValue = amountToPay / installments
        
        for (let i = 0; i < installments; i++) {
          const installmentRef = doc(collection(db, "contas_a_receber"))
          // Dynamic Due Date Calculation
          const dueDate = new Date(paymentInfo.firstDueDate || new Date())
          dueDate.setMonth(dueDate.getMonth() + i)

          batch.set(installmentRef, {
            saleId: saleRef.id,
            clientId,
            clientName,
            installmentNumber: i + 1,
            totalInstallments: installments,
            value: installmentValue,
            dueDate: dueDate.toISOString(),
            status: 'PENDING',
            createdAt: serverTimestamp()
          })
        }
      }

      await batch.commit()
      return { id: saleRef.id, ...paymentInfo, estimatedProfit }
      
    } catch (e: any) {
      console.error("🔥 Critical Sale Failure:", e)
      throw e
    }
  }
}
