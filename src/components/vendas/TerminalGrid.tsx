'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Filter, Package } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { db } from '@/utils/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

interface TerminalGridProps {
  onAdd: (product: any) => void
}

/**
 * PDV Conception v2.0 - TerminalGrid
 * Features: Real-time search, category filters, and Firestore sync.
 * Grid: 3 cols (Desktop) / 2 cols (Mobile)
 */
export function TerminalGrid({ onAdd }: TerminalGridProps) {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Real-time Firestore sync
  useEffect(() => {
    const q = query(collection(db, "produtos"), orderBy("name", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      setProducts(docs)
      setLoading(false)
    }, (error: any) => {
      console.error("Firestore Listen Error:", error)
      // Fallback data for demonstration if Firestore is empty/locked
      setProducts([
        { id: '1', name: 'Camiseta AgroTech Pro', price: 89.90, stock: 12, category: 'Vestuário' },
        { id: '2', name: 'Boné Sapphire Edition', price: 54.00, stock: 45, category: 'Acessórios' },
        { id: '3', name: 'Bota Premium Leather', price: 289.00, stock: 3, category: 'Calçados' },
        { id: '4', name: 'Caneca Inox Térmica', price: 120.00, stock: 20, category: 'Utilidades' },
        { id: '5', name: 'Mochila Expedition', price: 199.00, stock: 8, category: 'Acessórios' },
        { id: '6', name: 'Jaqueta Windbreaker', price: 340.00, stock: 5, category: 'Vestuário' },
      ])
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleAddToCart = (product: any) => {
    onAdd(product)
    setSearchTerm('')
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 50)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Search & Action Console */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Pesquisar por nome ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all">
          <Filter size={18} /> FILTRAR
        </button>
      </div>

      {/* Product Discovery Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
           <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
           <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Catálogo...</span>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filteredProducts.map(product => (
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
