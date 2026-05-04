import React, { useState, useEffect, useMemo } from 'react'
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  User,
  UserPlus,
  Search,
  XCircle,
  Banknote,
  QrCode,
  CreditCard,
  BookOpen
} from 'lucide-react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { CustomerModal } from '@/components/crm/CustomerModal'
import { CrediarioModal } from '@/components/vendas/CrediarioModal'
import { formatCurrency } from '@/utils/format'
import { useToast } from '@/components/layout/Toast'

interface ActiveCartProps {
  items: any[]
  selectedCustomer: any | null
  onSelectCustomer: (customer: any | null) => void
  isBounce: boolean
  onUpdateQty: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onFinalize: (paymentInfo: any) => void
  isProcessing: boolean
}

export function ActiveCart({ 
  items, 
  selectedCustomer, 
  onSelectCustomer, 
  isBounce, 
  onUpdateQty, 
  onRemove,
  onFinalize,
  isProcessing
}: ActiveCartProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [allCustomers, setAllCustomers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showCrediarioModal, setShowCrediarioModal] = useState(false)
  const [receivedAmount, setReceivedAmount] = useState<string>('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { showToast } = useToast()

  // 1. Initial Load of all customers for Fuzzy Search (v3.0 Robust)
  useEffect(() => {
    if (!db) return
    const q = query(collection(db, "clientes"), orderBy("name", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setAllCustomers(snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [])

  // 2. Fuzzy Search Logic (In-memory for speed)
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) return []
    const term = searchTerm.toLowerCase()
    return allCustomers.filter(c => 
      (c.name || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term)
    ).slice(0, 5)
  }, [searchTerm, allCustomers])

  // 3. Robust Price Mapping for Cart Calculations
  const getSafePrice = (item: any) => {
     const rawPrice = item.precoVenda ?? item.preco_venda ?? item.salePrice ?? item.price
     return Number(rawPrice || 0)
  }

  const subtotal = items.reduce((acc, item) => acc + (getSafePrice(item) * (item.qty || 0)), 0)
  const total = subtotal

  const change = Math.max(0, (parseFloat(receivedAmount) || 0) - total)

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      
      {/* 🟢 TOP SECTION WITH INDEPENDENT SCROLL */}
      <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
        {/* Active Header */}
        <div className="p-6 pb-4 border-b border-slate-50 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
               <div className={`p-2 bg-blue-600 text-white rounded-lg transition-transform duration-300 ${isBounce ? 'scale-125 animate-bounce' : ''}`}>
                  <ShoppingBag size={20} />
               </div>
               <h3 className="text-lg font-black text-slate-900 tracking-tighter">Carrinho</h3>
            </div>
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
              {items.length} itens
            </span>
          </div>
        </div>

        {/* CRM Section (Fast Bind) */}
        <div className="px-6 py-4 bg-slate-50/50 shrink-0">
           {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-scale-in">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                       <User size={16} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Cliente Vinculado</span>
                       <span className="text-xs font-bold text-slate-900 uppercase truncate max-w-[150px]">{selectedCustomer.name}</span>
                    </div>
                 </div>
                 <button 
                   onClick={() => onSelectCustomer(null)}
                   className="text-emerald-400 hover:text-red-500 transition-colors"
                 >
                    <XCircle size={18} />
                 </button>
              </div>
           ) : (
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Vincular cliente..."
                   value={searchTerm}
                   onFocus={() => setIsSearchFocused(true)}
                   onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold placeholder:text-slate-300 focus:border-blue-500 focus:outline-none transition-all"
                 />
                 <button 
                   onClick={() => setShowModal(true)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600"
                 >
                    <UserPlus size={16} />
                 </button>
  
                 {(searchResults.length > 0 && isSearchFocused) && (
                   <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] overflow-hidden divide-y divide-slate-100 animate-slide-up">
                      {searchResults.map(res => (
                        <button 
                          key={res.id} 
                          onClick={() => {
                             onSelectCustomer(res)
                             setSearchTerm('')
                             setIsSearchFocused(false)
                          }}
                          className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3"
                        >
                           <User size={14} className="opacity-40" /> {res.name}
                        </button>
                      ))}
                   </div>
                 )}
              </div>
           )}
        </div>
  
        {/* Items List */}
        <div className="flex-1 px-6 py-4 space-y-4">
          {items.length > 0 ? items.map((item) => {
            const itemPrice = getSafePrice(item)
            return (
              <div key={item.id} className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors animate-fade-in border border-transparent hover:border-slate-100">
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight truncate">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-bold text-slate-400">{formatCurrency(itemPrice)}</span>
                     <div className="h-1 w-1 rounded-full bg-slate-200" />
                     <span className="text-[10px] font-black text-blue-600">{formatCurrency(itemPrice * item.qty)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      <button onClick={() => onUpdateQty(item.id, -1)} className="p-1 hover:text-blue-600"><Minus size={12} /></button>
                      <span className="text-xs font-black min-w-[20px] text-center">{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.id, 1)} className="p-1 hover:text-blue-600"><Plus size={12} /></button>
                   </div>
                   <button onClick={() => onRemove(item.id)} className="text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            )
          }) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
               <ShoppingBag size={80} strokeWidth={1} />
               <p className="text-xs font-black uppercase tracking-widest mt-4">Vazio</p>
            </div>
          )}
        </div>
      </div> {/* <-- FECHA O WRAPPER DE SCROLL */}

      {/* 🔴 FIXED CHECKOUT HUB */}
      <div className="shrink-0 p-4 bg-slate-900 text-white space-y-3">
        {/* Giant Total */}
        <div className="flex flex-col gap-1">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total a Pagar</span>
           <h2 className="text-4xl font-black text-white tracking-tighter">
             {formatCurrency(total)}
           </h2>
        </div>

        {/* Change Input (Optional) */}
        <div className="flex items-center gap-3 py-2 border-y border-white/10">
           <div className="flex-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">Recebido (Dinheiro)</span>
              <input 
                type="number" 
                placeholder="0,00"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
           </div>
           {change > 0 && (
             <div className="text-right">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1 text-right">Troco</span>
                <span className="text-lg font-black text-emerald-400 tracking-tighter leading-none">{formatCurrency(change)}</span>
             </div>
           )}
        </div>

        {/* 4 Large Payment Buttons */}
        <div className="grid grid-cols-2 gap-2">
           <button 
             disabled={items.length === 0 || isProcessing}
             onClick={() => onFinalize({ method: 'DINHEIRO', received: parseFloat(receivedAmount) || total, change })}
             className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-20 active:scale-95"
           >
              <Banknote size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Dinheiro</span>
           </button>
           <button 
             disabled={items.length === 0 || isProcessing}
             onClick={() => onFinalize({ method: 'PIX', received: total, change: 0 })}
             className="py-2 px-3 bg-teal-600 hover:bg-teal-500 rounded-xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-20 active:scale-95"
           >
              <QrCode size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Pix</span>
           </button>
           <button 
             disabled={items.length === 0 || isProcessing}
             onClick={() => onFinalize({ method: 'CARTÃO', received: total, change: 0 })}
             className="py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-20 active:scale-95"
           >
              <CreditCard size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Cartão</span>
           </button>
           <button 
             disabled={items.length === 0 || isProcessing}
             onClick={() => {
               if (!selectedCustomer) {
                 showToast("Selecione um cliente para vender no Crediário", "error")
                 return
               }
               setShowCrediarioModal(true)
             }}
             className="py-2 px-3 bg-orange-600 hover:bg-orange-500 rounded-xl flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-20 active:scale-95"
           >
              <BookOpen size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Crediário</span>
           </button>
        </div>
      </div>

      {showModal && (
        <CustomerModal 
          onClose={() => setShowModal(false)} 
          onSuccess={(c) => onSelectCustomer(c)} 
        />
      )}

      {showCrediarioModal && (
        <CrediarioModal 
          total={total}
          customer={selectedCustomer}
          onClose={() => setShowCrediarioModal(false)}
          onConfirm={(payload) => {
            onFinalize(payload)
            setShowCrediarioModal(false)
          }}
        />
      )}
    </div>
  )
}
