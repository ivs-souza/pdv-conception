'use client'

import React from 'react'
import { Plus, Package } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
    category: string
  }
  onAdd: (product: any) => void
}

/**
 * PDV Conception v2.0 - ProductCard
 * Aesthetic: Sapphire Clean UI
 * Features: Stock badge, Price highlighting, Hover lift
 */
export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="premium-card group relative">
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
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estoque: {product.stock} un</span>
           {product.stock < 5 && (
             <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
           )}
        </div>
      </div>

      {/* Action Hub */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Preço</span>
          <span className="text-lg font-black text-slate-900 tracking-tight">
            R$ {product.price.toFixed(2)}
          </span>
        </div>
        <button 
          onClick={() => onAdd(product)}
          className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  )
}
