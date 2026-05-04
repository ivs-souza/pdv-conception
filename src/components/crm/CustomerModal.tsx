'use client'

import React, { useState } from 'react'
import { X, UserPlus, Phone, MapPin, Calendar, Check } from 'lucide-react'
import { CustomerService } from '@/services/customer.service'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'

interface CustomerModalProps {
  onClose: () => void
  onSuccess?: (customer: any) => void
}

/**
 * Sapphire v2.0 - CustomerModal
 * High-speed CRM registration for counter service.
 */
export function CustomerModal({ onClose, onSuccess }: CustomerModalProps) {
  const { userData } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving || !userData?.unidade) return
    
    setIsSaving(true)
    try {
      const newCustomer = await CustomerService.createCustomer(formData, userData.unidade)
      showToast("Cliente cadastrado com sucesso!", "success")
      
      if (onSuccess) onSuccess(newCustomer)
      
      // Delay closure for confirmation feedback
      setTimeout(() => onClose(), 800)
    } catch (err: any) {
      console.error("Erro CRM:", err)
      showToast(err.message || "Erro ao cadastrar cliente.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    document: '', // CPF/CNPJ
    address: '',
    birthDate: '',
  })

  return (
    <>
      <div 
        className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-md animate-fade-in no-print cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 no-print pointer-events-none">
        <div 
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-slate-100 flex flex-col pointer-events-auto max-h-[95vh] md:max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
        <header className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <UserPlus size={22} />
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-900 leading-none">Novo Cliente</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 block">Cadastro Express - CRM 2.0</span>
              </div>
           </div>
           <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X size={24} />
           </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
           {/* Priority Fields (Quick Registration) */}
           <div className="space-y-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-2">Fundamental para contato</span>
              <div className="grid grid-cols-1 gap-4">
                 <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="Nome Completo *"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                 </div>
                 <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="WhatsApp / Telefone *"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    />
                 </div>
              </div>
           </div>

           {/* Secondary Info */}
           <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">CPF</div>
                 <input 
                   type="text" 
                   placeholder="000.000.000-00"
                   value={formData.document}
                   onChange={e => setFormData({...formData, document: e.target.value})}
                   className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:border-slate-300 transition-all"
                 />
              </div>
              <div className="relative">
                 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Endereço Completo"
                   value={formData.address}
                   onChange={e => setFormData({...formData, address: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:border-slate-300 transition-all"
                 />
              </div>
              <div className="relative">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="date" 
                   value={formData.birthDate}
                   onChange={e => setFormData({...formData, birthDate: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:border-slate-300 transition-all"
                 />
              </div>
           </div>

           <div className="flex items-center justify-end gap-6 pt-6 border-t border-slate-50">
              <button type="button" onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Cancelar</button>
              <button 
                disabled={isSaving}
                type="submit" 
                className="btn-sapphire px-10 py-4 uppercase tracking-widest flex items-center gap-3 disabled:opacity-50"
              >
                 {isSaving ? "Salvando..." : "Salvar Cliente"} <Check size={18} />
              </button>
           </div>
        </form>
      </div>
    </div>
    </>
  )
}
