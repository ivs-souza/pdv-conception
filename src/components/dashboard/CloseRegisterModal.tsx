import React, { useState, useEffect } from 'react'
import { X, Lock, Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { CashService } from '@/services/cash.service'
import { SettingsService } from '@/services/settings.service'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/format'

interface CloseRegisterModalProps {
  register: any
  onClose: () => void
}

export function CloseRegisterModal({ register, onClose }: CloseRegisterModalProps) {
  const { userData } = useAuth()
  const [countedCash, setCountedCash] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchSummary = async () => {
       if (!register || !register.openedAt || !userData?.unidade) {
          setLoadingSummary(false)
          return
       }
       try {
          const s = await CashService.calculateTurnSummary(userData.unidade, userData.uid, register.openedAt.toDate())
          setSummary(s)
       } catch (e) {
          console.error(e)
       } finally {
          setLoadingSummary(false)
       }
    }
    fetchSummary()
  }, [register, userData?.unidade])

  const safeSummary = summary || {
    DINHEIRO: 0,
    PIX: 0,
    CARTAO: 0,
    FIADO: 0,
    RECEBIMENTO_FIADO_DINHEIRO: 0
  }

  // Fallback if register is null
  const initialCash = register?.initialCash || 0
  const expectedCash = initialCash + safeSummary.DINHEIRO + safeSummary.RECEBIMENTO_FIADO_DINHEIRO
  const countedVal = parseFloat(countedCash.replace(',', '.'))
  const isCountedValid = !isNaN(countedVal)
  const discrepancy = isCountedValid ? countedVal - expectedCash : 0

  const handleCloseRegister = async () => {
    if (!isCountedValid) {
       showToast("Informe o valor físico contado.", "error")
       return
    }

    setIsProcessing(true)
    try {
      if (!userData?.unidade) throw new Error("Unidade não identificada")
      await CashService.closeRegister(register.id, countedVal, expectedCash, safeSummary, userData.uid, userData.nome)
      showToast("Caixa fechado com sucesso!", "success")
      
      const settings = await SettingsService.getSettings(userData.unidade)
      
      const txtSummary = `
*FECHAMENTO DE CAIXA*
Abertura: ${register?.openedAt?.toDate().toLocaleString('pt-BR') || '---'}
Fundo Inicial: ${formatCurrency(initialCash)}
-------------------------
*VENDAS DO TURNO*
Dinheiro: ${formatCurrency(safeSummary.DINHEIRO)}
Pix: ${formatCurrency(safeSummary.PIX)}
Cartão: ${formatCurrency(safeSummary.CARTAO)}
Fiados (A Prazo): ${formatCurrency(safeSummary.FIADO)}
*Recebimento Fiado (Dinheiro):* ${formatCurrency(safeSummary.RECEBIMENTO_FIADO_DINHEIRO)}
-------------------------
*CONFERÊNCIA FÍSICA (GAVETA)*
Esperado: ${formatCurrency(expectedCash)}
Contado: ${formatCurrency(countedVal)}
*Quebra:* ${formatCurrency(discrepancy)} ${discrepancy < 0 ? '🚨' : discrepancy > 0 ? '⚠️' : '✅'}
`
      
      let messageBody = settings.store.whatsappTemplate
        .replace('[Nome do Cliente]', 'Administrador')
        .replace('[Nome da Loja]', settings.store.name)
        .replace('[Resumo]', txtSummary)

      let waUrl = `https://wa.me/`
      const phone = settings.store.adminPhone?.replace(/\D/g, '')
      if (phone) {
         waUrl += `${phone}`
      } else {
         showToast("Telefone do Admin não configurado. Selecione o contato manualmente.", "info")
      }
      waUrl += `?text=${encodeURIComponent(messageBody)}`

      window.open(waUrl, '_blank')

      onClose()
    } catch (e: any) {
      showToast(e.message || "Falha ao fechar caixa.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fade-in px-4 no-print">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex items-start justify-between shrink-0">
           <div>
              <div className="flex items-center gap-3 text-white mb-1">
                 <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                    <Lock size={20} />
                 </div>
                 <h2 className="text-xl font-black tracking-tight">Fechar Caixa</h2>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Auditoria e encerramento do turno.</p>
           </div>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full">
              <X size={16} />
           </button>
        </div>

        {!register || loadingSummary ? (
           <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        ) : (
           <div className="overflow-y-auto custom-scrollbar flex-1">
              <div className="p-6 space-y-6">
                 {/* Expected Summary */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fundo Inicial</span>
                       <span className="text-lg font-black text-slate-900 tracking-tight">{formatCurrency(initialCash)}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vendas Dinheiro + Fiado Rec.</span>
                       <span className="text-lg font-black text-emerald-600 tracking-tight">+ {formatCurrency(safeSummary.DINHEIRO + safeSummary.RECEBIMENTO_FIADO_DINHEIRO)}</span>
                    </div>
                 </div>

                 <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between">
                    <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Esperado na Gaveta</span>
                       <span className="text-2xl font-black tracking-tighter">{formatCurrency(expectedCash)}</span>
                    </div>
                    <DollarSign className="text-slate-700" size={32} />
                 </div>

                 <div className="w-full h-px bg-slate-100"></div>

                 {/* Input Counted Cash */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Calculator size={12} /> Valor Físico Contado (Dinheiro)
                    </label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                       <input 
                         type="number" 
                         step="0.01"
                         value={countedCash}
                         onChange={e => setCountedCash(e.target.value)}
                         className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                         placeholder="0.00"
                         autoFocus
                       />
                    </div>
                 </div>

                 {/* Discrepancy Display */}
                 {isCountedValid && (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                       discrepancy === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                       discrepancy > 0 ? 'bg-blue-50 border-blue-100 text-blue-600' :
                       'bg-red-50 border-red-100 text-red-600'
                    }`}>
                       <div>
                          <span className="text-[10px] font-black uppercase tracking-widest block mb-0.5">Quebra de Caixa</span>
                          <span className="text-lg font-black tracking-tight">{formatCurrency(Math.abs(discrepancy))}</span>
                       </div>
                       <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                          {discrepancy === 0 ? (
                             <>PERFEITO</>
                          ) : discrepancy > 0 ? (
                             <><TrendingUp size={14} /> SOBRA</>
                          ) : (
                             <><TrendingDown size={14} /> FALTA</>
                          )}
                       </div>
                    </div>
                 )}
              </div>

              <div className="p-6 pt-0 shrink-0">
                 <button 
                   onClick={handleCloseRegister}
                   disabled={isProcessing || !isCountedValid}
                   className="w-full py-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                 >
                    {isProcessing ? 'Processando...' : 'Confirmar Fechamento'}
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  )
}
