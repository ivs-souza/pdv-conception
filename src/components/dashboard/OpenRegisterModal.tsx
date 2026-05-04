import React, { useState } from 'react'
import { X, LockOpen, Wallet } from 'lucide-react'
import { CashService } from '@/services/cash.service'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/format'

interface OpenRegisterModalProps {
  onClose: () => void
}

export function OpenRegisterModal({ onClose }: OpenRegisterModalProps) {
  const { userData } = useAuth()
  const [initialCash, setInitialCash] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()

  const handleOpen = async () => {
    const val = parseFloat(initialCash.replace(',', '.'))
    if (isNaN(val) || val < 0) {
       showToast("Informe um valor válido para o fundo de caixa.", "error")
       return
    }

    setIsProcessing(true)
    try {
      if (!userData?.unidade) throw new Error("Unidade não identificada")
      await CashService.openRegister(val, userData.unidade)
      showToast("Caixa aberto com sucesso! Bom trabalho.", "success")
      onClose()
    } catch (e: any) {
      showToast(e.message || "Falha ao abrir caixa.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in px-4 no-print">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex items-start justify-between">
           <div>
              <div className="flex items-center gap-3 text-white mb-1">
                 <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <LockOpen size={20} />
                 </div>
                 <h2 className="text-xl font-black tracking-tight">Abrir Caixa</h2>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Informe o troco inicial para iniciar o turno de vendas.</p>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full">
              <X size={16} />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Wallet size={12} /> Fundo de Caixa (Troco)
              </label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                 <input 
                   type="number" 
                   step="0.01"
                   value={initialCash}
                   onChange={e => setInitialCash(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                   placeholder="0.00"
                   autoFocus
                 />
              </div>
           </div>

           <button 
             onClick={handleOpen}
             disabled={isProcessing}
             className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
           >
              {isProcessing ? 'Processando...' : 'Confirmar Abertura'}
           </button>
        </div>
      </div>
    </div>
  )
}
