import React from 'react'
import { User, AlertTriangle, Calendar, MessageCircle, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface CustomerDebtCardProps {
  customerDebt: {
    clientId: string
    clientName: string
    clientPhone?: string
    totalDebt: number
    overdueCount: number
    nearestDueDate: Date | null
    installments: any[]
  }
  onClick: () => void
}

export function CustomerDebtCard({ customerDebt, onClick }: CustomerDebtCardProps) {
  const { clientName, clientPhone, totalDebt, overdueCount, nearestDueDate, installments } = customerDebt

  const formatWhatsAppNumber = (phone: string) => {
    return phone.replace(/\D/g, '')
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!clientPhone) return
    const text = `Olá ${clientName}, notamos um saldo em aberto no crediário no valor de ${formatCurrency(totalDebt)}. Podemos ajudar com algo?`
    window.open(`https://wa.me/55${formatWhatsAppNumber(clientPhone)}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group flex flex-col gap-4 relative overflow-hidden"
    >
      {overdueCount > 0 && (
        <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
         <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white ${overdueCount > 0 ? 'bg-red-500' : 'bg-blue-600'}`}>
               {clientName?.charAt(0)?.toUpperCase() || <User size={16} />}
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{clientName || 'Cliente sem nome'}</h3>
               <span className="text-[10px] font-bold text-slate-400">{installments.length} parcela(s) pendente(s)</span>
            </div>
         </div>
      </div>

      {/* Financial Info */}
      <div className="flex items-end justify-between mt-2">
         <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total em Aberto</span>
            <span className={`text-2xl font-black tracking-tighter ${overdueCount > 0 ? 'text-red-500' : 'text-slate-900'}`}>
               {formatCurrency(totalDebt)}
            </span>
         </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
         <div className="flex items-center gap-4">
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2 py-1 rounded-md">
                 <AlertTriangle size={12} />
                 <span className="text-[10px] font-black uppercase tracking-widest">{overdueCount} em Atraso</span>
              </div>
            )}
            {nearestDueDate && overdueCount === 0 && (
              <div className="flex items-center gap-1.5 text-slate-400">
                 <Calendar size={12} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">
                   Próx: {nearestDueDate.toLocaleDateString('pt-BR')}
                 </span>
              </div>
            )}
         </div>

         <div className="flex items-center gap-2">
            {clientPhone && (
              <button 
                onClick={handleWhatsApp}
                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Cobrar via WhatsApp"
              >
                 <MessageCircle size={16} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
               <ChevronRight size={16} />
            </div>
         </div>
      </div>
    </div>
  )
}
