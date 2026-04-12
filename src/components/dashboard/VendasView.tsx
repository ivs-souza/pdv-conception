'use client'

import React, { useState } from 'react'
import { Plus, Search, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react'

/**
 * VendasView - Gravity Terminal
 * High-performance sales grid with Glassmorphism aesthetic.
 * Mobile-first optimization with floating cart and quick-add actions.
 */
export function VendasView({ onProceed }: { onProceed: () => void }) {
  const [cartCount, setCartCount] = useState(0)

  // Simulation of product data for UI demonstration
  const products = [
    { id: '1', name: 'CAMISETA AGRO TECH', price: 89.90, sku: 'LID-001', stock: 24 },
    { id: '2', name: 'BONÉ GRAVITY BLUE', price: 54.00, sku: 'LID-005', stock: 12 },
    { id: '3', name: 'BOTINA PREMIUM', price: 289.90, sku: 'LID-012', stock: 5 },
    { id: '4', name: 'MOCHILA EXPEDITION', price: 199.00, sku: 'LID-022', stock: 8 },
    { id: '5', name: 'ÓCULOS POLARIZADO', price: 120.00, sku: 'LID-031', stock: 15 },
    { id: '6', name: 'CANECO INOX 500ML', price: 45.00, sku: 'LID-042', stock: 45 },
  ]

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32">
      {/* Search & Header Station */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter leading-none">VENDAS</h2>
          <p className="text-blue-400 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 neon-glow animate-pulse" />
            Terminal Operacional Ativo
          </p>
        </div>
        
        <div className="relative group w-full lg:w-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="PESQUISAR PRODUTO OU SKU..." 
            className="w-full lg:w-[450px] pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl glass-panel focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all font-bold text-sm tracking-tight text-white placeholder:text-slate-600"
          />
        </div>
      </header>

      {/* Product Discovery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAdd={() => setCartCount(c => c + 1)} 
          />
        ))}
      </div>

      {/* Floating Cart - Gravity Mobile Experience */}
      <button 
        onClick={onProceed}
        className="fixed bottom-24 right-6 w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center neon-glow shadow-[0_20px_50px_rgba(59,130,246,0.3)] lg:hidden z-50 transform hover:scale-105 active:scale-95 transition-all border border-blue-400/30"
      >
        <ShoppingBag className="text-white" size={32} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl">
            {cartCount}
          </span>
        )}
      </button>

      {/* Desktop Quick Checkout Entry */}
      <div className="hidden lg:flex fixed bottom-16 right-12 glass-panel p-6 rounded-3xl items-center gap-10 border-white/10 shadow-2xl z-40">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SUBTOTAL</span>
          <span className="text-2xl font-black text-white">R$ {(cartCount * 89.9).toFixed(2)}</span>
        </div>
        <button 
          onClick={onProceed}
          className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/20"
        >
          PROSSEGUIR <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}

function ProductCard({ product, onAdd }: { product: any, onAdd: () => void }) {
  return (
    <div className="glass-card flex flex-col p-4 group relative overflow-hidden">
      <div className="aspect-[4/5] bg-slate-900/50 rounded-2xl mb-5 overflow-hidden relative border border-white/5 transition-transform duration-500 group-hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur px-2.5 py-1.5 rounded-lg text-[9px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-tighter">
          STOCK: {product.stock}
        </div>
        
        {/* Abstract Placeholder for Visual depth */}
        <div className="w-full h-full flex items-center justify-center opacity-20">
           <ShoppingCart size={64} className="text-slate-700" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mb-8">
        <h3 className="font-black text-sm text-white group-hover:text-blue-400 transition-colors tracking-tight leading-tight uppercase">
          {product.name}
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
          {product.sku}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-600 uppercase">PREÇO</span>
          <span className="text-xl font-black text-white">R$ {product.price.toFixed(2)}</span>
        </div>
        <button 
          onClick={onAdd}
          className="w-12 h-12 bg-white/5 hover:bg-blue-600 group-hover:bg-blue-600/20 text-blue-400 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-white/10 hover:border-blue-500/50 active:scale-90"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  )
}
