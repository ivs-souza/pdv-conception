'use client'

import React, { useState } from 'react'
import { Plus, Package, Download } from 'lucide-react'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { ProductModal } from '@/components/inventory/ProductModal'

/**
 * PDV Conception v2.0 - Estoque (Inventory)
 * Aesthetic: Clean & Clear Premium
 * Features: Real-time stock tracking and Profit Margin analysis.
 */
export default function EstoquePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Module Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                 <Package size={20} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Gestão de Estoque</h2>
           </div>
           <p className="text-muted font-medium ml-11">Controle de ativos, precificação e reposição inteligente.</p>
        </div>

        <div className="flex items-center gap-3">
           <button className="px-5 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={16} /> Relatórios
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="btn-sapphire px-6 py-3.5 shadow-xl shadow-blue-500/10"
           >
              <Plus size={18} /> Adicionar Produto
           </button>
        </div>
      </header>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="premium-card p-6 flex items-center gap-5">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
               <TrendingUpShadow />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Inventário</p>
               <h4 className="text-xl font-black text-slate-900 tracking-tight">R$ 145.200,30</h4>
            </div>
         </div>
         <div className="premium-card p-6 flex items-center gap-5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <Package size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens SKU Únicos</p>
               <h4 className="text-xl font-black text-slate-900 tracking-tight">342 Produtos</h4>
            </div>
         </div>
         <div className="premium-card p-6 flex items-center gap-5">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
               <AlertCircleShadow />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgência de Reposição</p>
               <h4 className="text-xl font-black text-red-600 tracking-tight">12 Alertas</h4>
            </div>
         </div>
      </div>

      {/* Table Interface */}
      <InventoryTable />

      {/* Modals Zone */}
      {isModalOpen && (
        <ProductModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

function TrendingUpShadow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
       <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
       <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  )
}

function AlertCircleShadow() {
   return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
         <circle cx="12" cy="12" r="10"></circle>
         <line x1="12" y1="8" x2="12" y2="12"></line>
         <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
   )
}
