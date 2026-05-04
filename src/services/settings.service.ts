import { db } from '@/utils/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  query,
  where 
} from 'firebase/firestore'

/**
 * Sapphire v2.2 - SettingsService
 * Central station for business rules, gateway fees, and maintenance.
 */
export const SettingsService = {
  /**
   * Fetches global settings (Fees, Store Info).
   * Fallback to default values if not configured in Firestore.
   */
  async getSettings(unidade: string) {
    const defaultSettings = {
      fees: {
        PIX: 0,
        DEBITO: 1.99,
        CREDITO: 3.49,
        FIADO: 0,
        DINHEIRO: 0
      },
      store: {
        name: 'Sapphire',
        address: '',
        adminPhone: '',
        whatsappTemplate: 'Olá [Nome do Cliente], aqui é da [Nome da Loja]. Segue o resumo da sua compra: [Resumo]. Agradecemos a preferência!'
      }
    }

    if (!db || !unidade) return defaultSettings

    try {
      const docRef = doc(db, "settings", unidade)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data()
      }
      
      return defaultSettings
    } catch (e) {
      console.error("Settings Fetch Error:", e)
      return defaultSettings
    }
  },

  /**
   * Updates global settings.
   */
  async saveSettings(settings: any, unidade: string) {
    if (!db) {
       console.error("❌ Save Settings Error: Database not connected.");
       throw new Error("Database not connected");
    }
    if (!unidade) throw new Error("Unidade não informada")
    
    try {
      console.log(`📡 Attempting to save settings for unit '${unidade}'...`, settings);
      const docRef = doc(db, "settings", unidade)
      await setDoc(docRef, { ...settings, unidade }, { merge: true })
      console.log("✅ Settings saved successfully.");
      return settings
    } catch (e: any) {
      console.error("❌ Save Settings Detailed Error:", {
        code: e.code,
        message: e.message,
        details: e
      });
      throw e;
    }
  },

  /**
   * Destructive utility to wipe collections (Maintenance Only).
   * Double confirmation logic resides in the UI layer.
   */
  async clearDatabase(unidade: string) {
    if (!db) throw new Error("Database not connected")
    if (!unidade) throw new Error("Unidade não informada")
    
    const collections = ["vendas", "produtos", "clientes", "contas_a_receber"]
    const results = []

    for (const collName of collections) {
      const q = query(collection(db, collName), where("unidade", "==", unidade))
      const snapshot = await getDocs(q)
      
      const batch = writeBatch(db)
      snapshot.docs.forEach((d: any) => {
        batch.delete(d.ref)
      })
      
      await batch.commit()
      results.push(collName)
    }

    return results
  }
}
