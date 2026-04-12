'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, MessageSquare, CreditCard, User, Users, MoreHorizontal, ShieldCheck } from 'lucide-react'
import { CustomerService } from '@/services/customer.service'

/**
 * CustomersPage - Gravity CRM Station
 * High-end customer management with credit health visibility.
 * Features Glassmorphism cards and direct WhatsApp integration.
 */
export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    CustomerService.getCustomers().then(setCustomers)
  }, [])

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.document.includes(searchTerm)
  )

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-40 font-gravity">
      {/* Header Station */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Users size={28} className="text-blue-400 neon-glow" />
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase">CLIENTES</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Gestão de Crédito & Relacionamento</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/20"
        >
          <Plus size={18} /> NOVO REGISTRO
        </button>
      </header>

      {/* Search Console */}
      <div className="relative group mb-12">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="PESQUISAR CLIENTE (NOME, CPF, TEL)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl glass-panel focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm text-white uppercase tracking-tight"
        />
      </div>

      {/* Gravity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {filteredCustomers.map(customer => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>

      {/* Quick Add Modal - Glass Style */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[1000] p-6">
          <div className="glass-card w-full max-w-lg p-10 border-white/10 shadow-2xl scale-in">
             <h2 className="text-2xl font-black text-white tracking-tight mb-8">NOVO CLIENTE</h2>
             <form className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">NOME COMPLETO</label>
                   <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold text-sm focus:border-blue-500/50 focus:outline-none" placeholder="Ex: Ivan Souza" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">WHATSAPP</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold text-sm focus:border-blue-500/50 focus:outline-none" placeholder="35 9..." />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">LIMITE CRÉDITO</label>
                      <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold text-sm focus:border-blue-500/50 focus:outline-none" placeholder="5000" />
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white">CANCELAR</button>
                   <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-4 font-black text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">CADASTRAR</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CustomerCard({ customer }: { customer: any }) {
  const isDebt = customer.current_balance < 0

  return (
    <div className="glass-card p-6 lg:p-8 flex flex-col group relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
             isDebt ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
           }`}>
              <User size={24} />
           </div>
           <div className="flex flex-col">
              <h3 className="text-md font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{customer.name}</h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{customer.document}</span>
           </div>
        </div>
        <button className="p-2 text-slate-500 hover:text-white transition-colors">
           <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">SALDO ATUAL</span>
            <span className={`text-lg font-black tracking-tight ${isDebt ? 'text-red-400' : 'text-emerald-400'}`}>
               R$ {Math.abs(customer.current_balance).toFixed(2)}
            </span>
         </div>
         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">LIMITE DISPON.</span>
            <span className="text-lg font-black text-white tracking-tight">R$ {customer.credit_limit.toFixed(2)}</span>
         </div>
      </div>

      <div className="mt-auto space-y-3">
         <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-xl border border-white/5 text-[9px] font-black text-slate-500 tracking-widest">
            <ShieldCheck size={12} className="text-blue-400" /> LGPD CONSENT: SIM (2026)
         </div>
         
         <button 
           onClick={() => window.open(`https://wa.me/${customer.whatsapp}`, '_blank')}
           className={`w-full py-4 rounded-xl font-black text-xs flex items-center justify-center gap-3 transition-all ${
             isDebt 
               ? 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white' 
               : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white hover:text-slate-950'
           }`}
         >
            <MessageSquare size={16} /> {isDebt ? 'COBRAR VIA WHATSAPP' : 'ENVIAR MENSAGEM'}
         </button>
      </div>
    </div>
  )
}
