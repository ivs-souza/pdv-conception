'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Package, TrendingUp, AlertCircle } from 'lucide-react'
import { ProductService } from '@/services/product.service'

/**
 * InventoryPage - Gravity Warehouse
 * High-performance inventory management with Glassmorphism tables.
 * Optimized for quick data entry and fiscal oversight.
 */
export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const currentRole: 'ADMIN' | 'SELLER' = 'ADMIN' // Simulation

  useEffect(() => {
    ProductService.getProducts(currentRole).then(setProducts)
  }, [])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm)
  )

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-40 font-gravity">
      {/* Dynamic Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Package size={28} className="text-blue-400 neon-glow" />
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase">ESTOQUE</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Gestão de Ativos & Patrimônio</p>
        </div>
        
        <button className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
          <Plus size={18} /> NOVO PRODUTO
        </button>
      </header>

      {/* Metrics Mini-Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
         <MetricCard icon={<Package size={16}/>} label="TOTAL ITENS" value={products.length.toString()} />
         <MetricCard icon={<TrendingUp size={16}/>} label="VALOR TOTAL" value="R$ 145.2k" color="text-emerald-400" />
         <MetricCard icon={<AlertCircle size={16}/>} label="ESTOQUE BAIXO" value="3" color="text-red-400" />
         <MetricCard icon={<Edit3 size={16}/>} label="ULT. ATUALIZ" value="HOJE" />
      </div>

      {/* Search Console */}
      <div className="relative group mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="BUSCAR NO INVENTÁRIO (NOME, SKU, NCM)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl glass-panel focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm text-white uppercase tracking-tight"
        />
      </div>

      {/* Data Station */}
      <div className="glass-panel rounded-3xl overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / IDENT</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DESCRIÇÃO</th>
                {currentRole === 'ADMIN' && (
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">CUSTO UNIT.</th>
                )}
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">VENDA UNIT.</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DISPONÍVEL</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-xs font-black text-slate-500 tracking-wider">#{product.sku}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase italic">{product.name}</span>
                  </td>
                  {currentRole === 'ADMIN' && (
                    <td className="px-8 py-6 font-mono text-xs text-slate-400">
                      R$ {product.cost_price.toFixed(2)}
                    </td>
                  )}
                  <td className="px-8 py-6 group-hover:scale-105 transition-transform origin-left">
                    <span className="text-md font-black text-white">R$ {product.sale_price.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                      product.stock_quantity < 5 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20 neon-glow' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {product.stock_quantity} UNID
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color = "text-white" }: any) {
  return (
    <div className="glass-panel p-5 rounded-2xl flex items-center gap-4 border-white/5">
       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400">
          {icon}
       </div>
       <div className="flex flex-col">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</span>
          <span className={`text-md font-black ${color} tracking-tight`}>{value}</span>
       </div>
    </div>
  )
}
