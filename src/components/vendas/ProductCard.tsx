'use client'

import React from 'react'
import { Plus, Package } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    salePrice?: number
    precoVenda?: number
    preco_venda?: number
    currentStock: number
    category: string
  }
  onAdd: (product: any) => void
}

/**
 * Sapphire v3.0 - ProductCard
 * Aesthetic: Sapphire Clean UI
 * Features: Robust price mapping, Stock alerts
 */
export function ProductCard({ product, onAdd }: ProductCardProps) {
  // Robust price conversion (v3.0 Safeguard)
  const rawPrice = product.precoVenda ?? product.preco_venda ?? product.salePrice
  const price = Number(rawPrice || 0)
  
  if (rawPrice === undefined) {
    console.warn(`⚠️ Produto [${product.name}] sem preço definido no Firestore.`, product)
  }

  return (
    <div 
      onClick={() => onAdd({ ...product, price })}
      className="premium-card group relative cursor-pointer active:scale-[0.98] transition-all hover:border-blue-200"
    >
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-100">
          {product.category}
        </span>
      </div>

      {/* Product Image Placeholder */}
      <div className="aspect-square bg-slate-50 rounded-lg mb-6 flex items-center justify-center text-slate-200 group-hover:text-blue-200 transition-colors">
        <Package size={48} />
      </div>

      {/* Info Cluster */}
      <div className="space-y-1 mb-6">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estoque: {product.currentStock} un</span>
           {product.currentStock < 5 && (
             <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
           )}
        </div>
      </div>

      {/* Action Hub */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Preço</span>
          <span className="text-lg font-black text-slate-900 tracking-tight">
            R$ {price.toFixed(2)}
          </span>
        </div>
        <button 
          onClick={() => onAdd({ ...product, price })}
          className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-100"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  )
}
