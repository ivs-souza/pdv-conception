import React from 'react'
import { X, ShoppingBag, Receipt, DollarSign, Clock, User, Hash } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface SaleDetailModalProps {
  sale: any
  onClose: () => void
}

export function SaleDetailModal({ sale, onClose }: SaleDetailModalProps) {
  if (!sale) return null

  const dateStr = sale.createdAt ? new Date(sale.createdAt.seconds * 1000).toLocaleString('pt-BR') : '---'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in px-4 no-print">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex items-start justify-between shrink-0">
           <div>
              <div className="flex items-center gap-3 text-white mb-2">
                 <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Receipt size={20} />
                 </div>
                 <h2 className="text-xl font-black tracking-tight">Detalhes da Venda</h2>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                 <span className="flex items-center gap-1"><Hash size={12}/> {sale.id.slice(-6).toUpperCase()}</span>
                 <span className="flex items-center gap-1"><Clock size={12}/> {dateStr}</span>
              </div>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full">
              <X size={16} />
           </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-8">
           
           {/* Info Cards */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <User size={14} />
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Cliente</span>
                    <span className="text-sm font-black text-slate-900">{sale.clientName || 'Cliente Padrão'}</span>
                 </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <DollarSign size={14} />
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Método de Pagamento</span>
                    <span className="text-sm font-black text-slate-900">{sale.paymentMethod}</span>
                 </div>
              </div>
           </div>

           {/* Items Table */}
           <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <ShoppingBag size={14} className="text-slate-400"/> Itens Vendidos
              </h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Produto</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qtd</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Subtotal</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {sale.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-4 py-3">
                                <span className="text-sm font-bold text-slate-900 block">{item.name}</span>
                                <span className="text-[10px] font-medium text-slate-400">{formatCurrency(item.priceAtSale || item.price)} unid.</span>
                             </td>
                             <td className="px-4 py-3 text-center text-sm font-black text-slate-700">
                                {item.qty}x
                             </td>
                             <td className="px-4 py-3 text-right text-sm font-black text-slate-900">
                                {formatCurrency((item.priceAtSale || item.price) * item.qty)}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Financial Summary */}
           <div className="bg-slate-900 rounded-2xl p-5 text-white space-y-3">
              <div className="flex items-center justify-between text-sm font-medium text-slate-400">
                 <span>Subtotal</span>
                 <span>{formatCurrency(sale.total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-400">
                 <span>Taxa Maquininha ({sale.feePercentage || 0}%)</span>
                 <span className="text-red-400">- {formatCurrency(sale.feeCharged || 0)}</span>
              </div>
              <div className="w-full h-px bg-slate-800 my-2"></div>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lucro Estimado</span>
                 <span className="text-lg font-black text-emerald-400">{formatCurrency(sale.estimatedProfit || 0)}</span>
              </div>
           </div>

        </div>

        <div className="p-6 pt-0 shrink-0 border-t border-slate-100">
           <button 
             onClick={onClose}
             className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
           >
              Fechar Detalhes
           </button>
        </div>
      </div>
    </div>
  )
}
