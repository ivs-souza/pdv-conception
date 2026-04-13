import { db } from '@/utils/firebase'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  increment 
} from 'firebase/firestore'

/**
 * Sapphire v2.0 - CustomerService
 * Relationships Management and Lifetime Value (LTV) Engine.
 */
export const CustomerService = {
  /**
   * Registers a new customer.
   */
  async createCustomer(data: any) {
    if (!db) throw new Error("Firebase not configured")
    try {
      const customerRef = collection(db, "clientes")
      const docRef = await addDoc(customerRef, {
        ...data,
        totalDebt: 0, // Initialize debt balance
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return { id: docRef.id, ...data }
    } catch (e) {
      console.error("Error creating customer:", e)
      throw e
    }
  },

  /**
   * Increments the customer's debt balance.
   */
  async incrementDebt(clientId: string, amount: number) {
    if (!db) return
    try {
      const customerRef = doc(db, "clientes", clientId)
      await updateDoc(customerRef, {
        totalDebt: increment(amount),
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error("Error updating debt:", e)
      throw e
    }
  },

  /**
   * Fetches total spending and last purchase date for a specific customer.
   */
  async getCustomerLTV(clientId: string) {
    if (!db) return { totalSpent: 0, lastPurchase: null, salesCount: 0 }
    try {
      const salesQuery = query(
        collection(db, "vendas"), 
        where("clientId", "==", clientId),
        orderBy("createdAt", "desc")
      )
      
      const snapshot = await getDocs(salesQuery)
      const sales = snapshot.docs.map((doc: any) => doc.data())
      
      const totalSpent = sales.reduce((acc: number, s: any) => acc + (s.total || 0), 0)
      const lastPurchase = sales.length > 0 ? (sales[0].createdAt?.toDate() || null) : null
      
      return { totalSpent, lastPurchase, salesCount: sales.length }
    } catch (e) {
      console.error("Error fetching LTV:", e)
      return { totalSpent: 0, lastPurchase: null, salesCount: 0 }
    }
  }
}
