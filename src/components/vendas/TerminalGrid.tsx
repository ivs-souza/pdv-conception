import React from 'react'
import { Package } from 'lucide-react'
import { ProductCard } from './ProductCard'

interface TerminalGridProps {
  products: any[]
  loading: boolean
  onAdd: (product: any) => void
}

/**
 * Sapphire v3.0 - TerminalGrid (Dumb Component)
 * Pure presentation layer for the product discovery grid.
 */
export function TerminalGrid({ products, loading, onAdd }: TerminalGridProps) {
  return (
    <div className="space-y-4">
      {/* Product Discovery Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
           <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
           <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sincronizando...</span>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAdd={onAdd} 
            />
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300 italic">
           <Package size={48} />
           <p className="text-sm font-bold uppercase tracking-[0.2em]">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  )
}
