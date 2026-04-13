'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  BookOpen, 
  AlertTriangle,
  Info 
} from 'lucide-react'

interface CheckoutModalProps {
  total: number
  customer: any | null
  onConfirm: (paymentInfo: any) => void
  onClose: () => void
}

/**
 * PDV Conception v2.0 - CheckoutModal (Flexible Edition)
 * Features: Multi-method support, cash calculator, and debt alerts.
 */
export function CheckoutModal({ total, customer, onConfirm, onClose }: CheckoutModalProps) {
  const [method, setMethod] = useState('DINHEIRO')
  const [received, setReceived] = useState('')
  const [notes, setNotes] = useState('')
  
  const receivedNum = Number(received) || 0
  const change = Math.max(0, receivedNum - total)
  
  const isDebtWarning = customer && (customer.totalDebt || 0) > 500

  const paymentMethods = [
    { id: 'DINHEIRO', label: 'Dinheiro', icon: <Banknote size={20} /> },
    { id: 'CREDITO', label: 'Crédito (Externo)', icon: <CreditCard size={20} /> },
    { id: 'DEBITO', label: 'Débito (Externo)', icon: <CreditCard size={20} /> },
    { id: 'PIX', label: 'PIX (Confirmação)', icon: <QrCode size={20} /> },
    { id: 'FIADO', label: 'Fiado / Caderneta', icon: <BookOpen size={20} /> },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-slide-up flex flex-col md:flex-row">
        
        {/* Left Panel: Payment Selection */}
        <div className="w-full md:w-56 bg-slate-50 p-8 border-r border-slate-100 space-y-4">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Meio de Pagamento</h3>
           <div className="space-y-2">
              {paymentMethods.map(m => (
                 <button 
                   key={m.id}
                   onClick={() => setMethod(m.id)}
                   className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all border ${
                     method === m.id 
                       ? 'bg-white border-blue-500 text-blue-600 shadow-md transform scale-[1.02]' 
                       : 'bg-transparent border-transparent text-slate-500 hover:bg-white/50'
                   }`}
                 >
                    {m.icon}
                    <span className="text-xs font-bold leading-none">{m.label}</span>
                 </button>
              ))}
           </div>
        </div>

        {/* Right Panel: Execution Context */}
        <div className="flex-1 p-10 flex flex-col">
           <header className="flex justify-between items-start mb-8">
              <div>
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Total Geral</h2>
                 <p className="text-4xl font-black text-blue-600 tracking-tighter mt-1">R$ {total.toFixed(2)}</p>
              </div>
              <button onClick={onClose} className="text-slate-300 hover:text-slate-500">
                 <X size={24} />
              </button>
           </header>

           {/* Customer Context & Alerts */}
           {customer && (
              <div className={`p-4 rounded-2xl flex items-center justify-between mb-8 border ${isDebtWarning ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{customer.name}</span>
                    {isDebtWarning && (
                       <div className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase animate-pulse">
                          <AlertTriangle size={14} /> Dívida Alta (R$ {customer.totalDebt.toFixed(2)})
                       </div>
                    )}
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venda Vinculada</div>
              </div>
           )}

           {/* Dynamic Method Inputs */}
           <div className="flex-1 space-y-6">
              {method === 'DINHEIRO' && (
                 <div className="space-y-4 animate-fade-in-down">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valor Recebido (R$)</label>
                       <input 
                         autoFocus
                         type="number" step="0.01"
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                         placeholder="0,00"
                         value={received}
                         onChange={e => setReceived(e.target.value)}
                       />
                    </div>
                    {receivedNum > 0 && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between animate-fade-in">
                         <span className="text-sm font-bold text-emerald-600">Troco</span>
                         <span className="text-2xl font-black text-emerald-600 tracking-tighter">R$ {change.toFixed(2)}</span>
                      </div>
                    )}
                 </div>
              )}

              {/* Memo / Notes */}
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Observações / Comprovante</label>
                 <textarea 
                   rows={2}
                   className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-slate-300 outline-none transition-all"
                   placeholder="Ex: Maquininha Stone, Parcelado 3x..."
                   value={notes}
                   onChange={e => setNotes(e.target.value)}
                 />
              </div>
           </div>

           {/* Final Action Hub */}
           <div className="pt-8 border-t border-slate-50 flex gap-4">
              <button 
                onClick={() => onConfirm({ method, received: receivedNum, change, notes })}
                className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
              >
                 FINALIZAR E GERAR RECIBO <CheckCircle2 size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
