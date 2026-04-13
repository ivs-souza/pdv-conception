'use client'

import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react'
import { db } from '@/utils/firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { formatCurrency } from '@/utils/format'
import { useToast } from '@/components/layout/Toast'

/**
 * PDV Conception v2.0 - InventoryTable
 * Features: Real-time Firestore sync, Stock Alerts, and Margin Analysis.
 */
export function InventoryTable() {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "produtos"), orderBy("name", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      setProducts(docs)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${name}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteDoc(doc(db, "produtos", id))
        showToast("Produto excluído com sucesso!", "success")
      } catch (e) {
        showToast("Erro ao excluir produto.", "error")
      }
    }
  }

  // Calculate Profit Margin
  const getMargin = (cost: number, sale: number) => {
    if (!cost || !sale) return 0
    return (((sale - cost) / sale) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Search & Action Console */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        <button className="px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all">
          <Filter size={18} /> FILTRAR
        </button>
      </div>

      {/* Main Inventory Grid */}
      <div className="premium-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Produto</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoria</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estoque Atual</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Venda</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Margem</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length > 0 ? filteredProducts.map(product => {
                const isLowStock = product.currentStock <= (product.minStock || 0)
                const margin = getMargin(product.costPrice, product.salePrice)
                
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                           {product.imageUrl ? (
                             <img src={product.imageUrl} className="w-full h-full object-cover rounded-lg" alt="" />
                           ) : (
                             <Package size={20} />
                           )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{product.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">SKU: {product.sku || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${
                          isLowStock 
                            ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {product.currentStock} UNID
                        </span>
                        {isLowStock && <AlertTriangle size={14} className="text-red-500" />}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-sm font-black text-slate-900">{formatCurrency(product.salePrice)}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-1.5 text-emerald-600">
                          <TrendingUp size={14} />
                          <span className="text-xs font-bold">{margin}%</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center justify-end gap-3">
                          <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                             <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                          >
                             <Trash size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    {!loading ? (
                      <div className="flex flex-col items-center gap-4 text-slate-300 italic">
                         <Package size={48} />
                         <span className="text-sm font-bold uppercase tracking-[0.2em]">Nenhum produto em estoque</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
