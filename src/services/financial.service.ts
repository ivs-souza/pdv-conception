import { db } from '@/utils/firebase'
import { collection, doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore'
import { CashService } from './cash.service'

/**
 * Sapphire v4.0 - Financial Service
 * Manages Accounts Receivables, Cash Flow entries, and Fines logic.
 */
export const FinancialService = {
  /**
   * Processes the payment of an installment (Crediário).
   * 1. Marks `contas_a_receber` as PAID.
   * 2. Registers the entry in `fluxo_de_caixa`.
   * 3. Decrements client's `totalDebt`.
   */
  async receivePayment(
    installmentId: string, 
    originalAmount: number, 
    paidAmount: number, 
    clientId: string,
    clientName: string,
    saleId: string,
    unidade: string,
    fineApplied: number = 0
  ) {
    if (!db) throw new Error("Database not connected")
    if (!unidade) throw new Error("Unidade não informada")

    const activeRegister = await CashService.getCurrentRegister(unidade)
    if (!activeRegister) {
       throw new Error("Caixa fechado. Abra o caixa para registrar recebimentos.")
    }

    const batch = writeBatch(db)

    // 1. Update Accounts Receivable
    const installmentRef = doc(db, "contas_a_receber", installmentId)
    batch.update(installmentRef, {
      status: 'PAID',
      paidAmount: paidAmount,
      fineApplied: fineApplied,
      paidAt: serverTimestamp()
    })

    // 2. Register Cash Flow Entry
    const cashFlowRef = doc(collection(db, "fluxo_de_caixa"))
    batch.set(cashFlowRef, {
      type: 'ENTRADA_CREDIARIO',
      amount: paidAmount,
      originalAmount: originalAmount,
      fineApplied: fineApplied,
      clientId: clientId,
      clientName: clientName,
      sourceId: installmentId,
      saleId: saleId,
      method: 'DINHEIRO', // Default assumption for manual receiving, could be expanded
      unidade, // Isolated Unit
      createdAt: serverTimestamp(),
      dateIso: new Date().toISOString()
    })

    // 3. Update Customer Debt (Mirror Logic)
    if (clientId) {
      const customerRef = doc(db, "clientes", clientId)
      batch.update(customerRef, {
        totalDebt: increment(-originalAmount),
        updatedAt: serverTimestamp()
      })
    }

    try {
      await batch.commit()
      return true
    } catch (e: any) {
      console.error("🔥 Error processing financial payment:", e)
      throw e
    }
  },

  /**
   * Calculates Default Brazilian Fine (Multa de 2% + Juros de 1% ao mês pro-rata)
   */
  calculateLateFee(dueDateStr: string, originalValue: number) {
    const today = new Date()
    const dueDate = new Date(dueDateStr)
    
    // Reset hours to compare pure dates
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    if (today <= dueDate) return 0 // Not late

    const diffTime = Math.abs(today.getTime() - dueDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const fixedFine = originalValue * 0.02 // 2% fixed fine
    const monthlyInterestRate = 0.01 // 1% per month
    const dailyInterestRate = monthlyInterestRate / 30
    
    const interest = originalValue * (dailyInterestRate * diffDays)

    return fixedFine + interest
  }
}
