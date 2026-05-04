import React, { useState, useEffect } from 'react'
import { X, ShoppingBag, Calendar, DollarSign, MessageCircle, Phone, ArrowRight, ExternalLink } from 'lucide-react'
import { db } from '@/utils/firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { formatCurrency, cleanPhone } from '@/utils/format'
import { SaleReceipt } from '@/components/vendas/SaleReceipt'

interface CustomerDetailsDrawerProps {
  customer: any
  onClose: () => void
}

/**
 * Sapphire CRM - CustomerDetailsDrawer
 * Premium lateral panel for deep customer insights and history.
 */
export function CustomerDetailsDrawer({ customer, onClose }: CustomerDetailsDrawerProps) {
  const [sales, setSales] = useState<any[]>([])
  const [selectedSale, setSelectedSale] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      if (!db || !customer?.id) return
      setLoading(true)
      try {
        const q = query(
          collection(db, "vendas"),
          where("clientId", "==", customer.id),
          limit(50)
        )
        const snap = await getDocs(q)
        const fetchedSales = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
        
        // Sort client-side to bypass missing index requirements for simple deployments
        fetchedSales.sort((a: any, b: any) => {
           const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
           const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
           return dateB.getTime() - dateA.getTime()
        })

        setSales(fetchedSales.slice(0, 10))
      } catch (e) {
        console.error("Error fetching customer history:", e)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [customer?.id])

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Olá ${customer.name}, tudo bem?`)
    const purePhone = cleanPhone(customer.phone)
    window.open(`https://wa.me/55${purePhone}?text=${message}`, '_blank')
  }

  const parseDate = (d: any) => {
    if (!d) return 'N/A'
    if (d.toDate) return d.toDate().toLocaleDateString()
    return new Date(d).toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slide-left flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-xl font-black uppercase">
                {customer.name.charAt(0)}
             </div>
             <div>
                <h2 className="text-lg font-black tracking-tight uppercase">{customer.name}</h2>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Perfil do Cliente</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Total Gasto</span>
                <p className="text-xl font-black text-emerald-700 tracking-tighter">
                   {formatCurrency(customer.totalSpent || 0)}
                </p>
             </div>
             <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Pedidos</span>
                <p className="text-xl font-black text-blue-700 tracking-tighter">
                   {customer.ordersCount || 0}
                </p>
             </div>
          </div>

          {/* Contact Actions */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contato Direto</h3>
             <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-3">
                      <Phone size={18} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{customer.phone}</span>
                   </div>
                   <button 
                     onClick={openWhatsApp}
                     className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                   >
                      WhatsApp <MessageCircle size={14} />
                   </button>
                </div>
             </div>
          </section>

          {/* Sales History */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Histórico de Compras</h3>
                <span className="text-[9px] font-bold text-slate-300">Últimas 10</span>
             </div>

             {loading ? (
                <div className="space-y-4">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
                   ))}
                </div>
             ) : sales.length > 0 ? (
                <div className="space-y-3">
                   {sales.map(sale => (
                      <div key={sale.id} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all group">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                               <Calendar size={14} className="text-slate-400" />
                               <span className="text-xs font-bold text-slate-600">{parseDate(sale.createdAt)}</span>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                               sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                               {sale.paymentMethod}
                            </span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-slate-900">{formatCurrency(sale.total || 0)}</span>
                            <button 
                              onClick={() => setSelectedSale(sale)}
                              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-all"
                            >
                               Detalhes <ArrowRight size={12} />
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             ) : (
                <div className="py-10 text-center space-y-2 opacity-30">
                   <ShoppingBag size={40} className="mx-auto" />
                   <p className="text-xs font-black uppercase tracking-widest">Nenhuma compra</p>
                </div>
             )}
          </section>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-slate-50 bg-slate-50">
           <button 
             onClick={onClose}
             className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
           >
              Fechar Detalhes
           </button>
        </footer>
      </div>

      {selectedSale && (
        <SaleReceipt 
          saleId={selectedSale.id}
          items={selectedSale.items || []}
          total={selectedSale.total}
          paymentInfo={{
             method: selectedSale.paymentMethod,
             received: selectedSale.receivedAmount || 0,
             change: selectedSale.changeAmount || 0,
             notes: selectedSale.notes || ''
          }}
          customer={customer}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  )
}
