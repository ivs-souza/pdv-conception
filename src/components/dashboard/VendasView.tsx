'use client'

import React, { useState } from 'react'
import { Plus, Search, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react'

/**
 * Modern VendasView - Gravity Fine-Tune
 * Grid: 2 columns on mobile | Price: Neon Blue
 * Focus: High speed and readability.
 */
export function VendasView({ onProceed }: { onProceed: () => void }) {
  const [cartCount, setCartCount] = useState(0)

  const products = [
    { id: '1', name: 'CAMISETA AGRO', price: 89.90, sku: 'LID-001', stock: 24 },
    { id: '2', name: 'BONÉ GRAVITY', price: 54.00, sku: 'LID-005', stock: 12 },
    { id: '3', name: 'BOTINA PREMIUM', price: 289.90, sku: 'LID-012', stock: 5 },
    { id: '4', name: 'MOCHILA AGRO', price: 199.00, sku: 'LID-022', stock: 8 },
  ]

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto gravity-container">
      <header className="flex flex-col gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">TERMINAL PDV</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
             <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase">Operação Online</span>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="PESQUISAR..." 
            className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl glass-panel text-sm font-bold text-white placeholder:text-slate-700"
          />
        </div>
      </header>

      {/* 2-Column Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {products.map(product => (
          <div key={product.id} className="glass-card flex flex-col p-3 lg:p-4 group">
             <div className="aspect-square bg-slate-900/50 rounded-lg mb-3 flex items-center justify-center opacity-40">
                <ShoppingCart size={32} />
             </div>
             
             <div className="flex flex-col gap-0.5 mb-4">
                <h3 className="text-[11px] lg:text-sm font-black text-white uppercase truncate">{product.name}</h3>
                <span className="text-[8px] font-bold text-slate-500 tracking-tighter">SKU: {product.sku}</span>
             </div>

             <div className="mt-auto flex items-center justify-between">
                <span className="text-sm lg:text-lg font-black text-neon-blue">R$ {product.price.toFixed(2)}</span>
                <button 
                  onClick={() => setCartCount(c => c + 1)}
                  className="w-8 h-8 lg:w-10 lg:h-10 bg-white/5 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg flex items-center justify-center transition-all border border-white/5"
                >
                  <Plus size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={onProceed}
        className="fixed bottom-20 right-5 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl lg:hidden z-50 text-white"
      >
        <ShoppingBag size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-blue-600 w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px]">
             {cartCount}
          </span>
        )}
      </button>

      {/* Desktop Bar */}
      <div className="hidden lg:flex fixed bottom-8 right-12 glass-panel p-5 rounded-2xl items-center gap-8 shadow-2xl z-50">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-500 uppercase">SUBTOTAL</span>
          <span className="text-xl font-black text-white">R$ {(cartCount * 89.9).toFixed(2)}</span>
        </div>
        <button 
          onClick={onProceed}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-blue-500 transition-all"
        >
          CHECKOUT <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
