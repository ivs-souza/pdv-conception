'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Percent, CreditCard, Smartphone, Banknote, Save, ArrowLeft } from 'lucide-react'
import { SettingsService } from '@/services/settings.service'
import { useToast } from '@/components/layout/Toast'
import Link from 'next/link'

/**
 * Sapphire v2.2 - Taxas Panel
 * Configuration for payment gateway fees.
 */
export default function TaxasPage() {
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fees, setFees] = useState<any>({
    PIX: 0,
    DEBITO: 0,
    CREDITO: 0,
    FIADO: 0,
    DINHEIRO: 0
  })
  const { showToast } = useToast()

  useEffect(() => {
    async function load() {
      const settings = await SettingsService.getSettings()
      setFees(settings.fees)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const currentSettings = await SettingsService.getSettings()
      await SettingsService.saveSettings({
        ...currentSettings,
        fees
      })
      showToast("Taxas atualizadas com sucesso!", "success")
    } catch (e) {
      showToast("Erro ao salvar taxas.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center text-blue-600 font-black animate-pulse uppercase tracking-widest text-xs">
      Carregando BI...
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <header className="flex items-center justify-between">
         <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Calculator size={22} />
               </div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Taxas Operacionais</h1>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-13">Configuração de Gateway & Maquininha</p>
         </div>
         <Link href="/" className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={16} /> Voltar
         </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Electronic Methods */}
         <section className="space-y-6">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-3">Meios Eletrônicos</h2>
            <div className="space-y-4">
               <FeeInput 
                 label="Pix" 
                 icon={<Smartphone size={18} />} 
                 value={fees.PIX}
                 onChange={(val: number) => setFees({...fees, PIX: val})}
               />
               <FeeInput 
                 label="Cartão de Débito" 
                 icon={<CreditCard size={18} className="text-emerald-500" />} 
                 value={fees.DEBITO}
                 onChange={(val: number) => setFees({...fees, DEBITO: val})}
               />
               <FeeInput 
                 label="Cartão de Crédito" 
                 icon={<CreditCard size={18} className="text-blue-500" />} 
                 value={fees.CREDITO}
                 onChange={(val: number) => setFees({...fees, CREDITO: val})}
               />
            </div>
         </section>

         {/* Local Methods */}
         <section className="space-y-6">
            <h2 className="text-[10px] font-black text-orange-600 uppercase tracking-widest border-l-4 border-orange-600 pl-3">Meios Locais</h2>
            <div className="space-y-4">
               <FeeInput 
                 label="Dinheiro (Espécie)" 
                 icon={<Banknote size={18} className="text-emerald-600" />} 
                 value={fees.DINHEIRO}
                 onChange={(val: number) => setFees({...fees, DINHEIRO: val})}
               />
               <FeeInput 
                 label="Fiado (Carteira)" 
                 icon={<Percent size={18} className="text-slate-400" />} 
                 value={fees.FIADO}
                 onChange={(val: number) => setFees({...fees, FIADO: val})}
               />
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl mt-12">
               <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3">Como funciona?</h4>
               <p className="text-[11px] leading-relaxed text-blue-900/70 font-medium">
                  As taxas configuradas aqui serão descontadas automaticamente no cálculo de <strong>Lucro Real</strong> no Terminal de Vendas e Dashboard. Exemplo: Uma venda de R$ 100,00 no Crédito (3.49%) registrará lucro sobre R$ 96,51.
               </p>
            </div>
         </section>
      </div>

      <div className="flex justify-end pt-10 border-t border-slate-100">
         <button 
           onClick={handleSave}
           disabled={isSaving}
           className="btn-sapphire px-12 py-4 flex items-center gap-3 uppercase tracking-tighter disabled:opacity-50"
         >
            {isSaving ? "Sincronizando..." : "Salvar Configurações"} <Save size={18} />
         </button>
      </div>
    </div>
  )
}

interface FeeInputProps {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (val: number) => void
}

function FeeInput({ label, icon, value, onChange }: FeeInputProps) {
  return (
    <div className="premium-card !p-5 flex items-center justify-between group">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
             {icon}
          </div>
          <div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
          </div>
       </div>
       <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
          <input 
            type="number" 
            step="0.01"
            className="w-16 bg-transparent border-none text-right font-black text-slate-900 text-sm focus:outline-none"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          />
          <span className="text-xs font-black text-slate-400">%</span>
       </div>
    </div>
  )
}
