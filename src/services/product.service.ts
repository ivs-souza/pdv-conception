import { db, storage } from '@/utils/firebase'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Sapphire v2.0 - ProductService
 * Core logic for Inventory Management and Product Assets.
 */
export const ProductService = {
  /**
   * Adds a new product to the Firestore collection.
   */
  async createProduct(data: any, unidade: string) {
    if (!db) throw new Error("Database not connected")
    if (!unidade) throw new Error("Unidade não informada")

    try {
      const productRef = collection(db, "produtos")
      const docRef = await addDoc(productRef, {
        ...data,
        unidade, // Isolated Unit
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        currentStock: Number(data.initialStock),
      })
      return docRef.id
    } catch (e) {
      console.error("Error creating product:", e)
      throw e
    }
  },

  /**
   * Updates an existing product.
   */
  async updateProduct(id: string, data: any) {
    if (!db) throw new Error("Database not connected")
    try {
      const productRef = doc(db, "produtos", id)
      
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      }

      // Force numeric type for stock integrity
      if (data.currentStock !== undefined) {
        updateData.currentStock = Number(data.currentStock)
      } else if (data.initialStock !== undefined) {
        // Fallback for modal fields
        updateData.currentStock = Number(data.initialStock)
      }

      await updateDoc(productRef, updateData)
    } catch (e) {
      console.error("Error updating product:", e)
      throw e
    }
  },

  /**
   * Deletes a product.
   */
  async deleteProduct(id: string) {
    if (!db) throw new Error("Database not connected")
    try {
      const productRef = doc(db, "produtos", id)
      await deleteDoc(productRef)
    } catch (e) {
      console.error("Error deleting product:", e)
      throw e
    }
  },

  /**
   * Handles image upload to Firebase Storage and returns the URL.
   */
  async uploadImage(file: File) {
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (e) {
      console.error("Error uploading image:", e)
      throw e
    }
  }
}
