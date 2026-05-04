'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Wallet,
  TrendingDown
} from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface CrediarioModalProps {
  total: number
  customer: any | null
  onConfirm: (paymentInfo: any) => void
  onClose: () => void
}

/**
 * Sapphire v3.9 - Shielded Crediário Module
 * Implementation: React Portal + useMemo + Static Layout (Zero Flickering)
 */
export function CrediarioModal({ total, customer, onConfirm, onClose }: CrediarioModalProps) {
  const [mounted, setMounted] = useState(false)
  const [entrance, setEntrance] = useState('0')
  const [installments, setInstallments] = useState(1)
  const [firstDueDate, setFirstDueDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    // Use local date to avoid UTC timezone shift (BR is UTC-3)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })

  // 1. Portal & Interaction Shielding
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // 2. Loop Prevention: Memoized Financials
  const financials = useMemo(() => {
    const entNum = Number(entrance) || 0
    const toPay = Math.max(0, total - entNum)
    const instVal = toPay / installments
    return {
      entranceNum: entNum,
      amountToPay: toPay,
      installmentValue: instVal
    }
  }, [total, entrance, installments])

  const handleConfirm = () => {
    onConfirm({
      method: 'FIADO',
      received: financials.entranceNum,
      change: 0,
      notes: `Crediário: ${installments}x de ${formatCurrency(financials.installmentValue)}`,
      entrance: financials.entranceNum,
      installments,
      firstDueDate
    })
  }

  if (!mounted) return null

  // 3. Render via Portal for DOM Isolation
  return createPortal(
    <div className="fixed inset-0 z-[99999] isolation-auto no-print flex items-center justify-center p-4 md:p-8">
      {/* Heavy Back-drop (Solid z-index) */}
      <div 
        className="fixed inset-0 bg-slate-900/90 backdrop-blur-md cursor-pointer pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Static Centered Body (Zero Motion) - Fixed Axis */}
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/20 z-[100000] overflow-hidden cursor-default flex flex-col max-h-[90vh] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                 <Wallet size={22} />
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-900 leading-none tracking-tight">Módulo de Crediário</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">Configuração de Parcelamento</span>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors p-2">
              <X size={24} />
           </button>
        </header>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
           {/* Summary Header */}
           <div className="flex justify-between items-end pb-6 border-b border-slate-100">
              <div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Carrinho</span>
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(total)}</p>
              </div>
              <div className="text-right">
                 <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">A Parcelar</span>
                 <p className="text-3xl font-black text-blue-600 tracking-tighter">{formatCurrency(financials.amountToPay)}</p>
              </div>
           </div>

           {/* Form Inputs */}
           <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entrada (R$)</label>
                 <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      autoFocus
                      type="number" 
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                      value={entrance}
                      onChange={e => setEntrance(e.target.value)}
                    />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Parcelas</label>
                 <div className="relative">
                    <TrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                      value={installments}
                      onChange={e => setInstallments(Number(e.target.value))}
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <option key={n} value={n}>{n}x</option>
                      ))}
                    </select>
                 </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mês do 1º Vencimento</label>
              <div className="relative">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="date" 
                   className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all cursor-pointer"
                   value={firstDueDate}
                   onChange={e => setFirstDueDate(e.target.value)}
                 />
              </div>
           </div>

           {/* Installment Preview Card (STABLE) */}
           <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-500/20 flex items-center justify-between border border-blue-500">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Parcelamento Safira</span>
                 <p className="text-xl font-black tracking-tight">{installments}x de</p>
              </div>
              <div className="text-right">
                 <p className="text-3xl font-black tracking-tighter">{formatCurrency(financials.installmentValue)}</p>
              </div>
           </div>

           {/* Final Sync Confirmation */}
           <div className="pt-4 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                 <CheckCircle2 className="text-emerald-500" size={20} />
                 <p className="text-[10px] font-bold text-emerald-700 leading-tight">
                    Confirmando o parcelamento, os registros financeiros e a baixa do estoque serão processados.
                 </p>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                 FINALIZAR PARCELAMENTO <CheckCircle2 size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
