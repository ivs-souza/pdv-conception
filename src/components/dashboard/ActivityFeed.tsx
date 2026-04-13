'use client'

import React from 'react'
import { Clock, ArrowUpRight, DollarSign, User } from 'lucide-react'

interface ActivityFeedProps {
  sales: any[]
}

/**
 * Sapphire v2.0 - ActivityFeed
 * Last 5 Transactions Table for the Command Center.
 */
export function ActivityFeed({ sales }: ActivityFeedProps) {
  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
              <Clock size={16} />
           </div>
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Últimas Vendas</h3>
        </div>
        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Ver Histórico</button>
      </div>

      <div className="space-y-6">
        {sales.length > 0 ? sales.map((sale) => (
          <div key={sale.id} className="flex items-center justify-between group animate-fade-in px-2 py-1 -mx-2 hover:bg-slate-50 rounded-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-slate-200/50">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Venda #{sale.id.slice(-5).toUpperCase()}</span>
                <span className="text-[11px] font-medium text-slate-400">Finalizada no Checkout</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-slate-900 mb-0.5">
                 <span className="text-sm font-black tracking-tight">R$ {(sale.total || 0).toFixed(2)}</span>
                 <ArrowUpRight size={14} className="text-emerald-500" />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 {sale.createdAt ? new Date(sale.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'}
              </span>
            </div>
          </div>
        )) : (
          <div className="py-12 flex flex-col items-center justify-center opacity-30 grayscale">
             <DollarSign size={40} className="mb-2" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem movimentação recente</p>
          </div>
        )}
      </div>
    </div>
  )
}
