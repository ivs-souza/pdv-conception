import { db } from '@/utils/firebase'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  limit, 
  serverTimestamp,
  onSnapshot,
  orderBy
} from 'firebase/firestore'

export const CashService = {
  subscribeToCurrentRegister(unidade: string, operatorId: string, callback: (register: any | null) => void, errorCallback?: (error: any) => void) {
    if (!db || !unidade) return () => {}
    const q = query(
      collection(db, "caixas"),
      where("unidade", "==", unidade),
      where("operatorId", "==", operatorId),
      where("status", "==", "OPEN"),
      orderBy("openedAt", "desc"),
      limit(1)
    )
    return onSnapshot(q, {
      next: (snap: any) => {
        if (snap.empty) {
          callback(null)
        } else {
          const d = snap.docs[0]
          callback({ id: d.id, ...d.data() })
        }
      },
      error: (err) => {
        if (errorCallback) errorCallback(err)
      }
    })
  },

  async getCurrentRegister(unidade: string, operatorId: string) {
    if (!db || !unidade) return null
    const q = query(
      collection(db, "caixas"), 
      where("unidade", "==", unidade),
      where("operatorId", "==", operatorId),
      where("status", "==", "OPEN"), 
      orderBy("openedAt", "desc"),
      limit(1)
    )
    const snap = await getDocs(q)
    if (snap.empty) return null
    const d = snap.docs[0]
    return { id: d.id, ...d.data() }
  },

  async openRegister(initialCash: number, unidade: string, operatorId: string, operatorName: string) {
    if (!db) throw new Error("Sem conexão com o banco.")
    if (!unidade) throw new Error("Unidade não informada")

    const current = await this.getCurrentRegister(unidade, operatorId)
    if (current) throw new Error("Você já possui um turno aberto.")

    const ref = await addDoc(collection(db, "caixas"), {
      status: 'OPEN',
      unidade, // Isolated Unit
      openedAt: serverTimestamp(),
      initialCash,
      operatorId,
      operatorName,
      createdAt: serverTimestamp()
    })
    return ref.id
  },

  async calculateTurnSummary(unidade: string, operatorId: string, openedAtDate: Date) {
     if (!db || !unidade) return null
     
     const salesQ = query(
        collection(db, "vendas"),
        where("unidade", "==", unidade),
        where("operatorId", "==", operatorId),
        where("createdAt", ">=", openedAtDate)
     )
     const salesSnap = await getDocs(salesQ)
     
     const cashFlowQ = query(
        collection(db, "fluxo_de_caixa"),
        where("unidade", "==", unidade),
        where("operatorId", "==", operatorId),
        where("createdAt", ">=", openedAtDate),
        where("type", "==", "ENTRADA_CREDIARIO")
     )
     const cfSnap = await getDocs(cashFlowQ)

     const summary = {
        DINHEIRO: 0,
        PIX: 0,
        CARTAO: 0,
        FIADO: 0, // Vendas a prazo realizadas no turno
        RECEBIMENTO_FIADO_DINHEIRO: 0 // Dinheiro que entrou quitando parcelas no turno
     }

     salesSnap.forEach((d: any) => {
        const sale = d.data()
        const method = sale.paymentMethod
        const amount = (sale.total || 0) - (sale.changeAmount || 0) // Liquido recebido
        
        if (method === 'DINHEIRO') summary.DINHEIRO += amount
        else if (method === 'PIX') summary.PIX += amount
        else if (method === 'FIADO') summary.FIADO += amount
        else summary.CARTAO += amount // CREDITO, DEBITO
     })

     cfSnap.forEach((d: any) => {
        const cf = d.data()
        // O recebimento de crediario padrão atual assume dinheiro
        summary.RECEBIMENTO_FIADO_DINHEIRO += cf.amount || 0
     })

     return summary
  },

  async closeRegister(id: string, finalCountedCash: number, expectedCash: number, summary: any, operatorId: string, operatorName: string) {
    if (!db) throw new Error("Sem conexão")
    
    const discrepancy = finalCountedCash - expectedCash

    await updateDoc(doc(db, "caixas", id), {
      status: 'CLOSED',
      closedAt: serverTimestamp(),
      finalCountedCash,
      expectedCash,
      discrepancy,
      closingOperatorId: operatorId,
      closingOperatorName: operatorName,
      summary
    })
    
    return discrepancy
  }
}
