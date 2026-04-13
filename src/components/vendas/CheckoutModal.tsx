'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  CheckCircle2, 
  X, 
  Banknote, 
  CreditCard, 
  QrCode, 
  BookOpen, 
  AlertTriangle,
  Info,
  Calendar,
  Wallet
} from 'lucide-react'

interface CheckoutModalProps {
  total: number
  customer: any | null
  onConfirm: (paymentInfo: any) => void
  onClose: () => void
}

/**
 * Sapphire v3.5 - Advanced Checkout Modal
 * Features: Professional Fiado installments, Cash calculator with High-Vis change, and Click-Outside closure.
 */
export function CheckoutModal({ total, customer, onConfirm, onClose }: CheckoutModalProps) {
  const [method, setMethod] = useState('DINHEIRO')
  const [received, setReceived] = useState('')
  const [notes, setNotes] = useState('')
  
  // Fiado specialized state
  const [entrance, setEntrance] = useState('0')
  const [installments, setInstallments] = useState(1)
  const [firstDueDate, setFirstDueDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  })

  const modalRef = useRef<HTMLDivElement>(null)
  
  const receivedNum = Number(received) || 0
  const change = Math.max(0, receivedNum - total)
  
  const entranceNum = Number(entrance) || 0
  const amountToPayInFiado = total - entranceNum
  const installmentValue = amountToPayInFiado / installments
  
  const isDebtWarning = customer && (customer.totalDebt || 0) > 500

  // Click Outside logic
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [onClose])

  const paymentMethods = [
    { id: 'DINHEIRO', label: 'Dinheiro', icon: <Banknote size={20} /> },
    { id: 'CREDITO', label: 'Crédito (Externo)', icon: <CreditCard size={20} /> },
    { id: 'DEBITO', label: 'Débito (Externo)', icon: <CreditCard size={20} /> },
    { id: 'PIX', label: 'PIX (Confirmação)', icon: <QrCode size={20} /> },
    { id: 'FIADO', label: 'Fiado / Caderneta', icon: <BookOpen size={20} /> },
  ]

  const handleHandleConfirm = () => {
    const payload: any = { 
      method, 
      notes,
      received: method === 'DINHEIRO' ? receivedNum : 0,
      change: method === 'DINHEIRO' ? change : 0
    }

    if (method === 'FIADO') {
      payload.entrance = entranceNum
      payload.installments = installments
      payload.firstDueDate = firstDueDate
    }

    onConfirm(payload)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-slide-up flex flex-col md:flex-row min-h-[500px]"
      >
        
        {/* Left Panel: Payment Selection */}
        <div className="w-full md:w-60 bg-slate-50 p-8 border-r border-slate-100 space-y-4">
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
                 <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Total à Receber</h2>
                 <p className="text-4xl font-black text-blue-600 tracking-tighter mt-1">
                   R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </p>
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
                          <AlertTriangle size={14} /> Dívida Alta (R$ {(customer?.totalDebt || 0).toFixed(2)})
                       </div>
                    )}
                 </div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ponto de Fidelidade</div>
              </div>
           )}

           {/* Dynamic Method Inputs */}
           <div className="flex-1 space-y-6">
              {method === 'DINHEIRO' && (
                 <div className="space-y-4 animate-fade-in-down">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valor Recebido do Cliente (R$)</label>
                       <input 
                         autoFocus
                         type="number" step="0.01"
                         className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-2xl font-black text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                         placeholder="0,00"
                         value={received}
                         onChange={e => setReceived(e.target.value)}
                       />
                    </div>
                    {receivedNum >= total && (
                      <div className="p-8 bg-emerald-500 rounded-3xl flex flex-col items-center justify-center animate-bounce-subtle mt-4 shadow-xl shadow-emerald-500/20">
                         <span className="text-xs font-black text-white/80 uppercase tracking-widest mb-1">Troco para Devolver:</span>
                         <span className="text-6xl font-black text-white tracking-tighter">
                           R$ {change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                         </span>
                      </div>
                    )}
                 </div>
              )}

              {method === 'FIADO' && (
                <div className="space-y-5 animate-fade-in-down">
                   {!customer ? (
                     <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3">
                        <Info className="text-amber-500" size={20} />
                        <span className="text-xs font-bold text-amber-700">Selecione um cliente para habilitar o Fiado.</span>
                     </div>
                   ) : (
                     <>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Entrada (R$)</label>
                              <div className="relative">
                                 <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                 <input 
                                   type="number"
                                   className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all"
                                   value={entrance}
                                   onChange={e => setEntrance(e.target.value)}
                                 />
                              </div>
                           </div>
                           <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nº Parcelas</label>
                              <select 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all cursor-pointer"
                                value={installments}
                                onChange={e => setInstallments(Number(e.target.value))}
                              >
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                                  <option key={n} value={n}>{n}x</option>
                                ))}
                              </select>
                           </div>
                        </div>

                        {/* Summary of Installments */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                           <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200/50">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor por Parcela</span>
                              <span className="text-xl font-black text-slate-900">
                                R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                           </div>
                           <div className="flex items-center gap-3">
                              <Calendar className="text-blue-500" size={18} />
                              <div className="flex-1">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data 1º Vencimento</label>
                                 <input 
                                   type="date"
                                   className="w-full py-1 bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer"
                                   value={firstDueDate}
                                   onChange={e => setFirstDueDate(e.target.value)}
                                 />
                              </div>
                           </div>
                        </div>
                     </>
                   )}
                </div>
              )}

              {/* Memo / Notes - Only if not Fiado (Fiado has its own logic) */}
              {method !== 'FIADO' && (
                <div className="animate-fade-in">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Comprovante / Notas</label>
                   <textarea 
                     rows={2}
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:border-slate-300 outline-none transition-all"
                     placeholder="Ex: Maquininha Stone, Comprovante PIX..."
                     value={notes}
                     onChange={e => setNotes(e.target.value)}
                   />
                </div>
              )}
           </div>

           {/* Final Action Hub */}
           <div className="pt-8 border-t border-slate-50 flex gap-4 mt-auto">
              <button 
                disabled={method === 'FIADO' && (!customer || installments < 1)}
                onClick={handleHandleConfirm}
                className={`flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${
                  method === 'FIADO' && (!customer)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                }`}
              >
                 FINALIZAR E BAIXAR ESTOQUE <CheckCircle2 size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
