'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, Calendar, DollarSign, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SaleService } from '@/services/sale.service'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/utils/format'
import { SaleDetailModal } from '@/components/vendas/SaleDetailModal'

export default function HistoricoVendasPage() {
  const { userData } = useAuth()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<any>(null)
  
  // Filters
  const [clientName, setClientName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('ALL')
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY')
  
  const [selectedSale, setSelectedSale] = useState<any | null>(null)

  const fetchSales = async (isLoadMore = false) => {
    if (!userData?.unidade) return
    if (isLoadMore) setLoadingMore(true)
    else setLoading(true)

    // Calculate dates based on period
    const now = new Date()
    let startDate: Date | undefined = undefined
    
    if (period === 'TODAY') {
       startDate = new Date()
       startDate.setHours(0, 0, 0, 0)
    } else if (period === 'WEEK') {
       startDate = new Date()
       startDate.setDate(now.getDate() - 7)
       startDate.setHours(0, 0, 0, 0)
    } else if (period === 'MONTH') {
       startDate = new Date()
       startDate.setMonth(now.getMonth() - 1)
       startDate.setHours(0, 0, 0, 0)
    }

    const { data, lastDoc: newLastDoc } = await SaleService.getSalesHistory(
      userData.unidade,
      isLoadMore ? lastDoc : null, 
      20, 
      { 
         startDate, 
         paymentMethod, 
         clientName: clientName.trim() !== '' ? clientName : undefined 
      }
    )

    if (isLoadMore) {
      setSales(prev => [...prev, ...data])
    } else {
      setSales(data)
    }
    
    setLastDoc(newLastDoc)
    setLoading(false)
    setLoadingMore(false)
  }

  // Trigger search when filters change, but debounce text input
  useEffect(() => {
    const timer = setTimeout(() => {
       fetchSales(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [clientName, paymentMethod, period])

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Link href="/vendas" className="text-slate-400 hover:text-slate-900 transition-colors">
                  <ArrowLeft size={24} />
               </Link>
               Histórico de Vendas
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-9">Auditoria e Detalhamento de Transações</p>
         </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-4 shadow-sm">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por nome do cliente..."
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
         </div>
         
         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shrink-0">
               <Calendar size={16} className="text-slate-400 ml-3 mr-2" />
               <select 
                 value={period} 
                 onChange={e => setPeriod(e.target.value as any)}
                 className="bg-transparent py-2 pr-4 text-xs font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
               >
                  <option value="TODAY">Hoje</option>
                  <option value="WEEK">7 Dias</option>
                  <option value="MONTH">30 Dias</option>
                  <option value="ALL">Todo Período</option>
               </select>
            </div>

            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shrink-0">
               <Filter size={16} className="text-slate-400 ml-3 mr-2" />
               <select 
                 value={paymentMethod} 
                 onChange={e => setPaymentMethod(e.target.value)}
                 className="bg-transparent py-2 pr-4 text-xs font-black uppercase tracking-widest text-slate-700 outline-none cursor-pointer"
               >
                  <option value="ALL">Todos os Métodos</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">Pix</option>
                  <option value="CARTÃO">Cartão</option>
                  <option value="FIADO">Fiado</option>
               </select>
            </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-100 rounded-[12px] shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID / Data</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Método</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Valor Total</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                     <tr>
                        <td colSpan={5} className="py-20 text-center">
                           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buscando auditoria...</span>
                        </td>
                     </tr>
                  ) : sales.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="py-20 text-center">
                           <DollarSign size={40} className="mx-auto mb-4 text-slate-200" />
                           <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Nenhuma venda encontrada</span>
                           <span className="text-[10px] font-bold text-slate-400">Ajuste os filtros de data ou cliente para ver mais resultados.</span>
                        </td>
                     </tr>
                  ) : (
                     sales.map((sale) => (
                        <tr 
                          key={sale.id} 
                          onClick={() => setSelectedSale(sale)}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                        >
                           <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-900 block mb-0.5">#{sale.id.slice(-6).toUpperCase()}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                 {sale.createdAt ? new Date(sale.createdAt.seconds * 1000).toLocaleString('pt-BR') : '---'}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-sm font-bold text-slate-900 block">{sale.clientName || 'Cliente Balcão'}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Operador: {sale.operatorName || 'Admin'}</span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                 sale.paymentMethod === 'FIADO' ? 'bg-orange-50 text-orange-600' :
                                 sale.paymentMethod === 'PIX' ? 'bg-emerald-50 text-emerald-600' :
                                 'bg-blue-50 text-blue-600'
                              }`}>
                                 {sale.paymentMethod}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <span className="text-sm font-black tracking-tight text-slate-900">{formatCurrency(sale.total)}</span>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all mx-auto">
                                 <ChevronRight size={16} />
                              </div>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
         
         {/* Pagination Footer */}
         {!loading && lastDoc && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center">
               <button 
                 onClick={() => fetchSales(true)}
                 disabled={loadingMore}
                 className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
               >
                  {loadingMore ? 'Carregando...' : 'Carregar Mais Vendas'}
               </button>
            </div>
         )}
      </div>

      {/* Detail Modal */}
      {selectedSale && (
         <SaleDetailModal 
           sale={selectedSale} 
           onClose={() => setSelectedSale(null)} 
         />
      )}
    </div>
  )
}
