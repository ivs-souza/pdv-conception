'use client'

import React, { useState, useEffect } from 'react'
import { db } from '@/utils/firebase'
import { collection, query, where, orderBy, onSnapshot, Timestamp, getDocs, updateDoc, doc } from 'firebase/firestore'
import { formatCurrency } from '@/utils/format'
import { ShoppingBag, CreditCard, Banknote, Smartphone, Clock } from 'lucide-react'

interface OperatorSalesListProps {
  unidade: string
  operatorId: string
  operatorName?: string
  openedAt?: any // Firebase Timestamp
  isOpen?: boolean
}

/**
 * Sapphire v4.0 - OperatorSalesList
 * Displays personal sales history for the current operator/shift.
 */
export function OperatorSalesList({ unidade, operatorId, operatorName, openedAt, isOpen }: OperatorSalesListProps) {
  const [sales, setSales] = useState<any[]>([])
  const [totals, setTotals] = useState({ DINHEIRO: 0, CARTAO: 0, PIX: 0, FIADO: 0, total: 0 })

  useEffect(() => {
    if (!db || !unidade || !operatorId || !isOpen) return

    const fixRecentSales = async () => {
      try {
        const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000)
        const qFix = query(
          collection(db, "vendas"),
          where("unidade", "==", unidade),
          where("createdAt", ">=", Timestamp.fromDate(halfHourAgo))
        )
        
        const snap = await getDocs(qFix)
        for (const d of snap.docs) {
          const data = d.data()
          if (!data.operatorId) {
            console.log('🩹 Auditoria: Carimbando venda retroativa:', d.id)
            await updateDoc(doc(db, "vendas", d.id), {
              operatorId: operatorId,
              operatorName: operatorName || 'Operador'
            })
          }
        }
      } catch (e) {
        console.error("🔥 Erro ao carimbar vendas retroativas:", e)
      }
    }

    fixRecentSales()
  }, [isOpen, operatorId, unidade])

  useEffect(() => {
    if (!db || !unidade || !operatorId) return

    // Filter by openedAt if available, otherwise fallback to today
    let startTimestamp: Timestamp
    if (openedAt) {
       // Support both Raw Firestore Timestamps and JSON serialized ones
       startTimestamp = (openedAt instanceof Timestamp) ? openedAt : new Timestamp(openedAt.seconds, openedAt.nanoseconds)
    } else {
       const today = new Date()
       today.setHours(0,0,0,0)
       startTimestamp = Timestamp.fromDate(today)
    }

    const q = query(
      collection(db, "vendas"),
      where("unidade", "==", unidade),
      where("operatorId", "==", operatorId),
      where("createdAt", ">=", startTimestamp),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setSales(data)

      // Calculate Totals
      const newTotals = data.reduce((acc: any, sale: any) => {
        const method = sale.paymentMethod || 'DINHEIRO'
        const amount = (sale.total || 0) - (sale.changeAmount || 0)
        
        if (method === 'DINHEIRO') acc.DINHEIRO += amount
        else if (method === 'PIX') acc.PIX += amount
        else if (method === 'FIADO') acc.FIADO += amount
        else acc.CARTAO += amount // CREDITO, DEBITO

        acc.total += amount
        return acc
      }, { DINHEIRO: 0, CARTAO: 0, PIX: 0, FIADO: 0, total: 0 })

      setTotals(newTotals)
    })

    return () => unsubscribe()
  }, [unidade, operatorId])

  return (
    <div className="space-y-6">
      {/* Mini Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
          label="Dinheiro" 
          value={totals.DINHEIRO} 
          icon={<Banknote size={16} />} 
          color="emerald" 
        />
        <SummaryCard 
          label="Cartão" 
          value={totals.CARTAO} 
          icon={<CreditCard size={16} />} 
          color="blue" 
        />
        <SummaryCard 
          label="Pix" 
          value={totals.PIX} 
          icon={<Smartphone size={16} />} 
          color="purple" 
        />
        <SummaryCard 
          label="Total Turno" 
          value={totals.total} 
          icon={<ShoppingBag size={16} />} 
          color="slate" 
          highlight
        />
      </div>

      {/* Sales List Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
           <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <ShoppingBag size={16} className="text-blue-600" />
              Minhas Vendas de Hoje
           </h3>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {sales.length} transações
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Hora</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Cliente</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Método</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sales.length > 0 ? sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={12} />
                        <span className="text-[11px] font-bold">
                           {sale.createdAt ? new Date(sale.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-[11px] font-bold text-slate-900 uppercase truncate max-w-[120px] block">
                        {sale.clientName || 'Consumidor'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        sale.paymentMethod === 'FIADO' ? 'bg-orange-100 text-orange-600' : 
                        sale.paymentMethod === 'PIX' ? 'bg-purple-100 text-purple-600' :
                        'bg-slate-100 text-slate-600'
                     }`}>
                        {sale.paymentMethod}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <span className="text-xs font-black text-slate-900">
                        {formatCurrency(sale.total)}
                     </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhuma venda realizada neste turno</p>
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

function SummaryCard({ label, value, icon, color, highlight = false }: any) {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    slate: 'text-slate-900 bg-slate-100 border-slate-200'
  }

  return (
    <div className={`p-4 rounded-2xl border transition-all ${highlight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center justify-between mb-2">
         <div className={`p-1.5 rounded-lg ${highlight ? 'bg-blue-600 text-white' : colors[color]}`}>
            {icon}
         </div>
         <span className={`text-[8px] font-black uppercase tracking-widest ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>
            {label}
         </span>
      </div>
      <p className={`text-sm font-black tracking-tighter ${highlight ? 'text-white' : 'text-slate-900'}`}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}
