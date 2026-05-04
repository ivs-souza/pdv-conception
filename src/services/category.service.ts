import { db } from '@/utils/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy,
  where 
} from 'firebase/firestore'

/**
 * Sapphire v3.1 - CategoryService
 * Logic: Customizable category management with pre-population.
 */
export const CategoryService = {
  /**
   * Fetches categories and pre-populates if empty.
   */
  async getCategories(unidade: string) {
    if (!db || !unidade) return []
    try {
      const q = query(
        collection(db, "categories"), 
        where("unidade", "==", unidade),
        orderBy("name", "asc")
      )
      const snap = await getDocs(q)
      
      if (snap.empty) {
        // Pre-population logic for 'Moda' niche
        const defaults = ['Blusas', 'Calças', 'Vestidos', 'Bodys', 'Acessórios']
        const promises = defaults.map(name => this.addCategory(name, unidade))
        await Promise.all(promises)
        
        // Fetch again after population
        const updatedSnap = await getDocs(q)
        return updatedSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
      }

      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    } catch (e) {
      console.error("Error fetching categories:", e)
      return []
    }
  },

  /**
   * Adds a new category.
   */
  async addCategory(name: string, unidade: string) {
    if (!db) throw new Error("Database not connected")
    if (!unidade) throw new Error("Unidade não informada")
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name,
        unidade, // Isolated Unit
        createdAt: serverTimestamp()
      })
      return { id: docRef.id, name }
    } catch (e) {
      console.error("Error adding category:", e)
      throw e
    }
  },

  /**
   * Deletes a category.
   */
  async deleteCategory(id: string) {
    if (!db) throw new Error("Database not connected")
    try {
      await deleteDoc(doc(db, "categories", id))
    } catch (e) {
      console.error("Error deleting category:", e)
      throw e
    }
  }
}
