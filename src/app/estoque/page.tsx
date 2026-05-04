'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Package, Download } from 'lucide-react'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { ProductModal } from '@/components/inventory/ProductModal'
import { db } from '@/utils/firebase'
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/format'
import { useToast } from '@/components/layout/Toast'

/**
 * Sapphire v2.0 - Estoque (Inventory)
 * Aesthetic: Clean & Clear Premium
 * Features: Real-time stock tracking and Profit Margin analysis.
 */
export default function EstoquePage() {
  const { userData } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  // Centralized Intelligence Listener
  useEffect(() => {
    if (!db || !userData?.unidade) return
    const q = query(
      collection(db, "produtos"), 
      where("unidade", "==", userData.unidade),
      orderBy("name", "asc")
    )
    
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false)
        console.warn("⏱️ Stock Sync Timeout: Verifique as permissões do Firebase.");
      }
    }, 5000)

    const unsubscribe = onSnapshot(q, 
      (snapshot: any) => {
        const docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
        setProducts(docs)
        setLoading(false)
        clearTimeout(timer)
      },
      (error: any) => {
        console.error("🔥 Firestore Permission Error in Estoque:", error);
        showToast("Erro de permissão no banco de dados.", "error");
        setLoading(false)
        clearTimeout(timer)
      }
    )
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [userData?.unidade])

  const handleEdit = (product: any) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Real-time Business Logic Calculations
  const stats = useMemo(() => {
    const totalValue = products.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.currentStock || 0)), 0)
    const activeAlerts = products.filter(p => (p.currentStock || 0) <= (p.minStock || 0)).length
    
    return {
      totalValue,
      totalSkus: products.length,
      activeAlerts
    }
  }, [products])

  return (
    <>
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
             onClick={() => {
               setSelectedProduct(null)
               setIsModalOpen(true)
             }}
             className="btn-sapphire px-6 py-3.5 shadow-xl shadow-blue-500/10"
           >
              <Plus size={18} /> Adicionar Produto
           </button>
        </div>
      </header>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="premium-card p-6 flex items-center gap-5">
            <div className={`p-3 bg-emerald-50 text-emerald-600 rounded-xl ${loading ? 'animate-pulse' : ''}`}>
               <TrendingUpShadow />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Inventário</p>
               <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {loading ? 'R$ ---' : formatCurrency(stats.totalValue)}
               </h4>
            </div>
         </div>
         <div className="premium-card p-6 flex items-center gap-5">
            <div className={`p-3 bg-blue-50 text-blue-600 rounded-xl ${loading ? 'animate-pulse' : ''}`}>
               <Package size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens SKU Únicos</p>
               <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {loading ? '---' : stats.totalSkus} Produtos
               </h4>
            </div>
         </div>
         <div className="premium-card p-6 flex items-center gap-5">
            <div className={`p-3 bg-red-50 text-red-600 rounded-xl ${loading ? 'animate-pulse' : ''}`}>
               <AlertCircleShadow />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgência de Reposição</p>
               <h4 className={`text-xl font-black tracking-tight ${stats.activeAlerts > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {loading ? '---' : stats.activeAlerts} Alertas
               </h4>
            </div>
         </div>
      </div>

      {/* Table Interface */}
      <InventoryTable products={products} loading={loading} onEdit={handleEdit} />

      </div>

      {/* Modals Zone */}
      {isModalOpen && (
        <ProductModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
        />
      )}
    </>
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
