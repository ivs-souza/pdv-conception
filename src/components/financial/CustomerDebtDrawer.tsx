import React, { useEffect, useState } from 'react'
import { X, User, AlertTriangle, Wallet } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { ReceivableCard } from '@/components/financial/ReceivableCard'
import { FinancialService } from '@/services/financial.service'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'

interface CustomerDebtDrawerProps {
  customerDebt: {
    clientId: string
    clientName: string
    clientPhone?: string
    totalDebt: number
    overdueCount: number
    installments: any[]
  } | null
  isRegisterOpen?: boolean
  onClose: () => void
}

export function CustomerDebtDrawer({ customerDebt, isRegisterOpen = true, onClose }: CustomerDebtDrawerProps) {
  const { userData } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (customerDebt) {
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [customerDebt])

  if (!customerDebt) return null

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const handleReceiveAll = async () => {
    if (!confirm(`Confirmar recebimento total de ${formatCurrency(customerDebt.totalDebt)} para ${customerDebt.clientName}?`)) return
    
    setIsProcessing(true)
    try {
      const unpaid = customerDebt.installments.filter(i => i.status !== 'PAID' && i.status !== 'PAGO')
      
      // Execute all payment receives
      for (const inst of unpaid) {
        let lateFee = 0
        const today = new Date()
        today.setHours(0,0,0,0)
        const dueDate = new Date(inst.dueDate)
        dueDate.setHours(0,0,0,0)
        if (today > dueDate) {
          lateFee = FinancialService.calculateLateFee(inst.dueDate, inst.value)
        }
        const finalAmount = inst.value + lateFee

        await FinancialService.receivePayment(
          inst.id,
          inst.value,
          finalAmount,
          inst.clientId,
          inst.clientName,
          inst.saleId,
          userData!.unidade,
          userData!.uid,
          userData!.nome,
          lateFee
        )
      }
      
      showToast('Todas as parcelas foram recebidas com sucesso!', 'success')
      handleClose()
    } catch (e: any) {
      console.error(e)
      showToast(e.message || 'Erro ao processar recebimentos.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}
      onClick={handleOverlayClick}
    >
      <div 
        className={`w-full max-w-md h-full bg-slate-50 flex flex-col shadow-2xl transition-transform duration-300 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                 <User size={20} />
              </div>
              <div>
                 <h2 className="text-base font-black text-slate-900 uppercase tracking-tight line-clamp-1">{customerDebt.clientName}</h2>
                 <p className="text-[10px] font-bold text-slate-400">{customerDebt.installments.length} parcelas ativas</p>
              </div>
           </div>
           <button onClick={handleClose} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-full">
              <X size={20} />
           </button>
        </div>

        {/* Action Bar (Receive All) */}
        {customerDebt.installments.some(i => i.status !== 'PAID' && i.status !== 'PAGO') && (
          <div className="bg-slate-900 text-white p-6 shrink-0">
             <div className="flex items-end justify-between mb-4">
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Total Consolidado</span>
                   <span className="text-3xl font-black tracking-tighter text-white">
                      {formatCurrency(customerDebt.totalDebt)}
                   </span>
                </div>
                {customerDebt.overdueCount > 0 && (
                  <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg flex items-center gap-2">
                     <AlertTriangle size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{customerDebt.overdueCount} Atrasos</span>
                  </div>
                )}
             </div>
             <button 
               onClick={handleReceiveAll}
               disabled={isProcessing || !isRegisterOpen}
               className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all rounded-xl flex flex-col items-center justify-center gap-1 disabled:opacity-50"
             >
                <span className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={16} /> 
                  {isProcessing ? 'Processando...' : 'Receber Tudo Agora'}
                </span>
             </button>
          </div>
        )}

        {/* Installments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
           
           {!isRegisterOpen && (
              <div className="bg-amber-50 text-amber-600 p-3 rounded-xl flex items-center justify-center gap-2 mb-4 border border-amber-200 shadow-sm animate-pulse">
                 <AlertTriangle size={16} className="shrink-0" />
                 <span className="text-[11px] font-black uppercase tracking-widest text-center">⚠ Caixa fechado. Abra o caixa para realizar recebimentos.</span>
              </div>
           )}

           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento das Parcelas</h3>
           {customerDebt.installments.map(inst => (
             <ReceivableCard 
                key={inst.id} 
                installment={inst} 
                isRegisterOpen={isRegisterOpen}
             />
           ))}
        </div>
      </div>
    </div>
  )
}
