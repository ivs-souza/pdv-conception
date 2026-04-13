'use client'

import React from 'react'
import { Banknote, QrCode, BookOpen, Info } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface CashFlowGridProps {
  data: {
    DINHEIRO: number
    ELECTRONIC: number
    FIADO: number
  }
}

/**
 * PDV Conception v2.1 - CashFlowGrid
 * Granular receivables view.
 */
export function CashFlowGrid({ data }: CashFlowGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
       {/* Dinheiro */}
       <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Banknote size={18} />
             </div>
             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Líquido</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dinheiro em Caixa</span>
          <h4 className="text-xl font-black text-slate-900 mt-1 tracking-tight">{formatCurrency(data.DINHEIRO)}</h4>
          <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 italic">
             <Info size={10} className="text-blue-400" />
             Lembre-se de conferir as moedas.
          </div>
       </div>

       {/* Eletrônicos */}
       <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <QrCode size={18} />
             </div>
             <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Digital</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Entradas PIX/Cartão</span>
          <h4 className="text-xl font-black text-slate-900 mt-1 tracking-tight">{formatCurrency(data.ELECTRONIC)}</h4>
          <p className="mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confirmação via Extrato</p>
       </div>

       {/* Fiado */}
       <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                <BookOpen size={18} />
             </div>
             <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Pendente</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total em Aberto (Fiado)</span>
          <h4 className="text-xl font-black text-slate-900 mt-1 tracking-tight">{formatCurrency(data.FIADO)}</h4>
          <p className="mt-3 text-[9px] font-bold text-orange-400 uppercase tracking-widest">Não contabilizado no líquido</p>
       </div>
    </div>
  )
}
