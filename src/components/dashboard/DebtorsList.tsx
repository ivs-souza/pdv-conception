'use client'

import React from 'react'
import { AlertCircle, MessageCircle, ArrowRight } from 'lucide-react'

interface DebtorsListProps {
  debtors: any[]
}

/**
 * PDV Conception v2.1 - DebtorsList
 * Monitor de Inadimplência (Top 3 Devedores).
 */
export function DebtorsList({ debtors }: DebtorsListProps) {
  const openWhatsApp = (client: any) => {
    const message = encodeURIComponent(`Olá ${client.name}, estamos atualizando nosso financeiro na PDV Conception. Consta um saldo em aberto de R$ ${client.totalDebt.toFixed(2)}. Como podemos facilitar o acerto?`)
    window.open(`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  return (
    <div className="premium-card">
       <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertCircle size={16} />
             </div>
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Top Devedores</h3>
          </div>
          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest animate-pulse">Atenção</span>
       </div>

       <div className="space-y-6">
          {debtors.length > 0 ? debtors.map((client) => (
            <div key={client.id} className="flex items-center justify-between group px-2 py-1 -mx-2 hover:bg-slate-50 rounded-xl transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all border border-slate-200/50">
                     {client.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{client.name}</span>
                     <span className="text-[10px] font-bold text-red-500 tracking-tighter">R$ {client.totalDebt.toFixed(2)}</span>
                  </div>
               </div>
               
               <button 
                 onClick={() => openWhatsApp(client)}
                 className="p-2 bg-white text-emerald-500 rounded-lg shadow-sm border border-slate-100 hover:bg-emerald-500 hover:text-white transition-all"
                 title="Enviar sugestão de acerto"
               >
                  <MessageCircle size={16} />
               </button>
            </div>
          )) : (
            <div className="py-10 text-center opacity-20 grayscale">
               <p className="text-[10px] font-black uppercase tracking-widest">Nenhum débito alto</p>
            </div>
          )}
       </div>

       <button className="w-full mt-10 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 flex items-center justify-center gap-2 hover:text-blue-600 transition-all">
          Ver CRM Completo <ArrowRight size={14} />
       </button>
    </div>
  )
}
