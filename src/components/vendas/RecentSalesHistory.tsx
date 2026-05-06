'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/utils/firebase'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { formatCurrency } from '@/utils/format'
import { Clock, ShoppingCart, User, ArrowUpRight } from 'lucide-react'

export function RecentSalesHistory() {
  const [sales, setSales] = useState<any[]>([])

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, "vendas"), orderBy("createdAt", "desc"), limit(10))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setSales(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="bg-white border-t border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-900 text-white rounded-lg">
           <ShoppingCart size={16} />
        </div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Atividade Recente do Terminal</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {sales.length > 0 ? sales.map((sale) => (
          <div key={sale.id} className="min-w-[280px] bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-3 hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                     <User size={14} />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-900 truncate max-w-[120px] uppercase">
                        {sale.clientName || 'Cliente Avulso'}
                     </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                         {sale.createdAt ? new Date(sale.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} • {sale.operatorName || 'Admin'}
                      </span>
                  </div>
               </div>
               <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                 sale.paymentMethod === 'FIADO' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
               }`}>
                  {sale.paymentMethod}
               </div>
            </div>

            <div className="flex items-end justify-between">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                  <span className="text-base font-black text-slate-900 tracking-tighter">
                     {formatCurrency(sale.total)}
                  </span>
               </div>
               <div className="flex -space-x-2">
                  {sale.items?.slice(0, 3).map((item: any, idx: number) => (
                    <div key={idx} className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400 shadow-sm">
                       {item.qty}
                    </div>
                  ))}
                  {sale.items?.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                       +{sale.items.length - 3}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )) : (
          <div className="w-full py-8 flex flex-col items-center justify-center text-slate-300">
             <Clock size={32} strokeWidth={1} className="mb-2 opacity-20" />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Nenhuma venda registrada hoje</p>
          </div>
        )}
      </div>
    </div>
  )
}
