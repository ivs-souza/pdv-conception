import { db } from '@/utils/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * PDV Conception v2.0 - SaleService
 * Logic: Handles sale registration and Firestore persistence.
 */
export const SaleService = {
  /**
   * Registers a new sale in the system.
   * Captures full payment metadata for financial accuracy.
   */
  async registerSale(
    items: any[], 
    total: number, 
    clientId: string | null = null, 
    clientName: string | null = null,
    paymentInfo: {
      method: string,
      received: number,
      change: number,
      notes: string
    }
  ) {
    try {
      const saleRef = collection(db, "vendas")
      
      const localizedItems = items.map(item => ({
        ...item,
        costAtSale: item.costPrice || 0,
      }))

      const docRef = await addDoc(saleRef, {
        items: localizedItems,
        total,
        clientId,
        clientName,
        paymentMethod: paymentInfo.method,
        receivedAmount: paymentInfo.received,
        changeAmount: paymentInfo.change,
        notes: paymentInfo.notes,
        status: paymentInfo.method === 'FIADO' ? 'UNPAID' : 'COMPLETED',
        createdAt: serverTimestamp(),
        currency: 'BRL',
        estimatedProfit: total - localizedItems.reduce((acc: number, item: any) => acc + (item.costAtSale * item.qty), 0)
      })
      
      return { id: docRef.id, ...paymentInfo }
    } catch (e) {
      console.error("Error adding sale: ", e)
      throw e
    }
  }
}
