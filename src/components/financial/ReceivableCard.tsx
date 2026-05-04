'use client'

import React, { useState } from 'react'
import { CheckCircle2, AlertTriangle, Clock, User, Banknote } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { FinancialService } from '@/services/financial.service'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'

interface ReceivableCardProps {
  installment: any
  isRegisterOpen?: boolean
  onProcessed?: () => void
}

/**
 * Sapphire v4.0 - ReceivableCard
 * Displays a single debt installment, handles status colors and fast checkouts.
 */
export function ReceivableCard({ installment, isRegisterOpen = true, onProcessed }: ReceivableCardProps) {
  const { userData } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()

  // Dynamic Status Calculation
  const isPaid = installment.status === 'PAID' || installment.status === 'PAGO'
  
  let isOverdue = false
  let lateFee = 0
  
  if (!isPaid) {
    const today = new Date()
    today.setHours(0,0,0,0)
    const dueDate = new Date(installment.dueDate)
    dueDate.setHours(0,0,0,0)
    
    if (today > dueDate) {
      isOverdue = true
      lateFee = FinancialService.calculateLateFee(installment.dueDate, installment.value)
    }
  }

  const finalAmount = installment.value + lateFee

  const formatShortDate = (isoString: string) => {
    if (!isoString) return '--/--/----'
    const d = new Date(isoString)
    // Avoid UTC shift issues
    const adjustedDate = new Date(d.valueOf() + d.getTimezoneOffset() * 60000)
    return adjustedDate.toLocaleDateString('pt-BR')
  }

  const handleReceivePayment = async () => {
    if (isProcessing) return
    setIsProcessing(true)
    
    try {
      await FinancialService.receivePayment(
        installment.id,
        installment.value,
        finalAmount, // Pay full amount including fines
        installment.clientId,
        installment.clientName,
        installment.saleId,
        userData!.unidade,
        lateFee
      )
      
      showToast("Pagamento recebido com sucesso!", "success")
      if (onProcessed) onProcessed()
    } catch (e: any) {
      console.error(e)
      showToast("Falha ao registrar pagamento.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  // Visuals
  const statusColor = isPaid 
    ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
    : isOverdue 
      ? "bg-red-50 border-red-100 text-red-600"
      : "bg-amber-50 border-amber-100 text-amber-600"

  const StatusIcon = isPaid ? CheckCircle2 : (isOverdue ? AlertTriangle : Clock)

  return (
    <div className={`premium-card p-6 flex flex-col gap-5 border transition-all ${isOverdue && !isPaid ? 'border-red-200' : 'border-slate-100'}`}>
       
       {/* Header: Client & Status */}
       <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
             <div className={`p-2.5 rounded-xl flex items-center justify-center ${statusColor}`}>
                <User size={18} />
             </div>
             <div>
                <h4 className="text-sm font-black text-slate-900 truncate max-w-[200px]">{installment.clientName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                   Parcela {installment.installmentNumber} / {installment.totalInstallments}
                </p>
             </div>
          </div>
          
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor}`}>
             <StatusIcon size={12} />
             <span>{isPaid ? 'Pago' : (isOverdue ? 'Atrasado' : 'Pendente')}</span>
          </div>
       </div>

       {/* Values & Timeline */}
       <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vencimento</span>
             <p className={`text-sm font-bold ${isOverdue && !isPaid ? 'text-red-500' : 'text-slate-900'}`}>{formatShortDate(installment.dueDate)}</p>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                {isPaid ? 'Valor Pago' : (isOverdue ? 'A Receber (C/ Multa)' : 'Valor da Parcela')}
             </span>
             <p className={`text-lg font-black tracking-tight ${isPaid ? 'text-emerald-500' : (isOverdue ? 'text-red-600' : 'text-slate-900')}`}>
                {isPaid ? formatCurrency(installment.paidAmount || installment.value) : formatCurrency(finalAmount)}
             </p>
          </div>
       </div>

       {/* Late Fee Notice */}
       {isOverdue && !isPaid && (
          <div className="text-[10px] font-bold text-red-500/80 bg-red-50 p-2 rounded flex justify-between items-center -mt-2">
            <span>Valor Original: {formatCurrency(installment.value)}</span>
            <span>Multa/Juros: +{formatCurrency(lateFee)}</span>
          </div>
       )}

       {/* Actions */}
       {!isPaid && (
          <div className="pt-4 border-t border-slate-100/60 mt-auto">
             <button 
               onClick={handleReceivePayment}
               disabled={isProcessing || !isRegisterOpen}
               className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
             >
                <Banknote size={16} /> Receber Pagamento
             </button>
          </div>
       )}
    </div>
  )
}
