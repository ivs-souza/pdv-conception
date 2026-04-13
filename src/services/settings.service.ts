import { db } from '@/utils/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch 
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
  async getSettings() {
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
        whatsappTemplate: 'Olá [Nome do Cliente], aqui é da [Nome da Loja]. Segue o resumo da sua compra: [Resumo]. Agradecemos a preferência!'
      }
    }

    if (!db) return defaultSettings

    try {
      const docRef = doc(db, "settings", "global")
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
  async saveSettings(settings: any) {
    if (!db) {
       console.error("❌ Save Settings Error: Database not connected.");
       throw new Error("Database not connected");
    }
    
    try {
      console.log("📡 Attempting to save settings to 'settings/global'...", settings);
      const docRef = doc(db, "settings", "global")
      await setDoc(docRef, settings, { merge: true })
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
  async clearDatabase() {
    if (!db) throw new Error("Database not connected")
    
    const collections = ["vendas", "produtos", "clientes"]
    const results = []

    for (const collName of collections) {
      const q = collection(db, collName)
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
