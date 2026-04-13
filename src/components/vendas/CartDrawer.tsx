'use client'

import React, { useState } from 'react'
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard,
  ArrowRight,
  User,
  UserPlus,
  Search,
  XCircle
} from 'lucide-react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { CustomerModal } from '@/components/crm/CustomerModal'

interface CartDrawerProps {
  items: any[]
  selectedCustomer: any | null
  onSelectCustomer: (customer: any | null) => void
  isBounce: boolean
  onUpdateQty: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

/**
 * Sapphire v2.0 - CartDrawer
 * Feature: Lateral checkout fixed on Desktop.
 * Interaction: Scale-up bounce animation on add.
 */
export function CartDrawer({ 
  items, 
  selectedCustomer, 
  onSelectCustomer, 
  isBounce, 
  onUpdateQty, 
  onRemove, 
  onCheckout 
}: CartDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0)
  const tax = subtotal * 0.05 // Placeholder for some tax or fee

  const handleSearchCustomer = async (val: string) => {
    setSearchTerm(val)
    if (val.length < 2) {
      setSearchResults([])
      return
    }

    if (!db) return
    try {
      const q = query(
        collection(db, "clientes"), 
        where("name", ">=", val.toUpperCase()), 
        where("name", "<=", val.toUpperCase() + "\uf8ff"),
        limit(5)
      )
      const snap = await getDocs(q)
      setSearchResults(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="premium-card h-full flex flex-col min-h-[500px] border-slate-200/60 shadow-xl lg:sticky lg:top-8 relative">
      {/* Header with Bounce Animation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-blue-50 text-blue-600 rounded-lg transition-transform duration-300 ${isBounce ? 'scale-125 animate-bounce' : ''}`}>
            <ShoppingBag size={20} />
          </div>
          <h3 className="text-md font-bold text-slate-900 tracking-tight">Carrinho</h3>
        </div>
        <span className="bg-slate-900 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest">
          {items.length} itens
        </span>
      </div>

      {/* CRM Customer Binder Section */}
      <div className="mb-8 space-y-3">
         {selectedCustomer ? (
           <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-fade-in">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                    <User size={16} />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Venda vinculada</span>
                    <span className="text-xs font-bold text-slate-900 uppercase truncate max-w-[150px]">{selectedCustomer.name}</span>
                 </div>
              </div>
              <button 
                onClick={() => onSelectCustomer(null)}
                className="text-emerald-300 hover:text-emerald-600 transition-colors"
              >
                 <XCircle size={20} />
              </button>
           </div>
         ) : (
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Vincular cliente..."
                value={searchTerm}
                onChange={(e) => handleSearchCustomer(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-blue-400 focus:outline-none transition-all"
              />
              <button 
                onClick={() => setShowModal(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                 <UserPlus size={16} />
              </button>

              {/* CRM Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-50 animate-fade-in">
                   {searchResults.map(res => (
                     <button 
                       key={res.id} 
                       onClick={() => {
                          onSelectCustomer(res)
                          setSearchResults([])
                          setSearchTerm('')
                       }}
                       className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-50 transition-colors flex items-center gap-3"
                     >
                        <User size={14} className="text-slate-300" /> {res.name}
                     </button>
                   ))}
                </div>
              )}
           </div>
         )}
      </div>

      {/* Items Stream */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        {items.length > 0 ? items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-tight line-clamp-1">{item.name}</p>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400">R$ {(item.price || 0).toFixed(2)}</span>
                 <div className="h-1 w-1 rounded-full bg-slate-200" />
                 <span className="text-[10px] font-black text-blue-600">R$ {((item.price || 0) * (item.qty || 0)).toFixed(2)}</span>
              </div>
              
              {/* Qty Controls */}
              <div className="flex items-center gap-3 mt-2">
                <button 
                  onClick={() => onUpdateQty(item.id, -1)}
                  className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs font-black text-slate-900 min-w-[12px] text-center">{item.qty}</span>
                <button 
                  onClick={() => onUpdateQty(item.id, 1)}
                  className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            <button 
              onClick={() => onRemove(item.id)}
              className="text-slate-300 hover:text-red-500 transition-colors pt-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
             <ShoppingBag size={64} className="mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">Carrinho Vazio</p>
          </div>
        )}
      </div>

      {/* Summary Execution Hub */}
      <div className="mt-auto pt-8 border-t border-slate-100 space-y-4">
        <div className="space-y-2">
           <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span>R$ {(subtotal || 0).toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Taxas (5%)</span>
              <span>R$ {(tax || 0).toFixed(2)}</span>
           </div>
        </div>

        <div className="flex justify-between items-center py-4 border-y border-dashed border-slate-200">
           <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Geral</span>
           <span className="text-2xl font-black text-blue-600 tracking-tighter">R$ {(subtotal + tax || 0).toFixed(2)}</span>
        </div>

        <button 
          disabled={items.length === 0}
          onClick={onCheckout}
          className="w-full btn-sapphire py-5 flex items-center justify-center gap-4 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed uppercase"
        >
          FINALIZAR VENDA <ArrowRight size={20} />
        </button>
        
        <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <CreditCard size={12} /> Preparado para Asaas API
        </div>
      </div>

      {showModal && (
        <CustomerModal 
          onClose={() => setShowModal(false)} 
          onSuccess={(c) => onSelectCustomer(c)} 
        />
      )}
    </div>
  )
}
