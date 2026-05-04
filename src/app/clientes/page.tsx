'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  MessageCircle, 
  Plus, 
  DollarSign, 
  Calendar,
  Phone,
  ArrowRight
} from 'lucide-react'
import { db } from '@/utils/firebase'
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { CustomerModal } from '@/components/crm/CustomerModal'
import { CustomerDetailsDrawer } from '@/components/crm/CustomerDetailsDrawer'
import { CustomerService } from '@/services/customer.service'
import { cleanPhone, formatCurrency } from '@/utils/format'
import { useToast } from '@/components/layout/Toast'

/**
 * Sapphire v2.0 - Clientes (CRM)
 * Hub de Relacionamento e Engajamento Direct-to-WA.
 */
export default function ClientesPage() {
  const { userData } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (!db || !userData?.unidade) return
    const q = query(
      collection(db, "clientes"), 
      where("unidade", "==", userData.unidade),
      orderBy("name", "asc")
    )
    
    // Safety Fallback: 5s connection guard
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false)
        console.warn("⏱️ CRM Timeout: Verifique sua conexão ou permissões do banco.")
      }
    }, 5000)

    const unsubscribe = onSnapshot(q, {
      next: (snapshot: any) => {
        const docs = snapshot.docs.map((docSnap: any) => ({
          id: docSnap.id,
          ...docSnap.data()
        }))
        setClients(docs)
        setLoading(false)
        setIsSyncing(false)
        clearTimeout(timer)
      },
      error: (err) => {
        console.error("CRM Snapshot Error:", err)
        if (err.code === 'failed-precondition') {
          setIsSyncing(true)
          setLoading(false)
        }
      }
    })
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [userData?.unidade])

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  )

  const openWhatsApp = (client: any) => {
    const message = encodeURIComponent(`Olá ${client.name}, sentimos sua falta na Sapphire! Temos novidades para você.`)
    const purePhone = cleanPhone(client.phone)
    window.open(`https://wa.me/55${purePhone}?text=${message}`, '_blank')
  }

  return (
    <>
      <div className="space-y-10 animate-fade-in pb-20">
      {/* Module Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                 <Users size={20} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Gestão de Clientes</h2>
           </div>
           <p className="text-muted font-medium ml-11">Relacionamento, fidelidade e engajamento direto.</p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-sapphire px-6 py-3.5 shadow-xl shadow-blue-500/10 flex items-center gap-2"
        >
           <Plus size={18} /> Novo Cliente
        </button>
      </header>

      {/* CRM Console (Search & Filter) */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou celular..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
           <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
           <span className="text-xs font-bold uppercase tracking-widest">Carregando CRM...</span>
        </div>
      ) : isSyncing ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
           <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
              <Users size={24} />
           </div>
           <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest block mb-2">Sincronizando CRM com o banco...</span>
              <p className="text-[10px] font-medium max-w-[200px]">Estamos organizando seus contatos. Isso leva apenas alguns minutos.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
             <ClientCard 
               key={client.id} 
               client={client} 
               onWhatsApp={openWhatsApp} 
               onClick={() => setSelectedClient(client)}
             />
          ))}
        </div>
      )}

      </div>

      {/* Modals Zone */}
      {isModalOpen && (
        <CustomerModal onClose={() => setIsModalOpen(false)} />
      )}

      {selectedClient && (
        <CustomerDetailsDrawer 
          customer={selectedClient} 
          onClose={() => setSelectedClient(null)} 
        />
      )}
    </>
  )
}

function ClientCard({ client, onWhatsApp, onClick }: any) {
  // Safe date parsing for Firestore Timestamp or ISO String
  const parseDate = (d: any) => {
    if (!d) return null
    if (d.toDate) return d.toDate() // Firestore Timestamp
    return new Date(d)
  }

  const lastPurchaseDate = parseDate(client.lastPurchase)
  
  const daysSinceLastPurchase = lastPurchaseDate 
    ? Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 3600 * 24))
    : null

  const isInactive = daysSinceLastPurchase !== null && daysSinceLastPurchase > 30

  return (
    <div 
      onClick={onClick}
      className="premium-card group hover:border-blue-200 transition-all cursor-pointer"
    >
       <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg uppercase border border-slate-200/50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {client.name.charAt(0)}
             </div>
             <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{client.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                   <Phone size={12} />
                   <span className="text-[10px] font-bold">{client.phone}</span>
                </div>
             </div>
          </div>
          
          <button 
            onClick={(e) => {
               e.stopPropagation()
               onWhatsApp(client)
            }}
            className={`p-2 rounded-xl transition-all ${isInactive ? 'bg-orange-50 text-orange-600 animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
            title={isInactive ? "Cliente inativo há mais de 30 dias!" : "Enviar mensagem"}
          >
             <MessageCircle size={20} />
          </button>
       </div>

       {/* Engagement Metrics */}
       <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
          <div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Gasto</span>
             <div className="flex items-center gap-1 text-emerald-600">
                <DollarSign size={14} />
                <span className="text-sm font-black tracking-tight">R$ {(client?.totalSpent || 0).toFixed(2)}</span>
             </div>
          </div>
          <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Última Compra</span>
              <div className="flex items-center gap-1 text-slate-600">
                 <Calendar size={14} />
                 <span className="text-xs font-bold">{lastPurchaseDate ? lastPurchaseDate.toLocaleDateString() : 'Nunca'}</span>
              </div>
          </div>
       </div>

        <div className="pt-4 flex items-center justify-between">
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              {(client.ordersCount || client.salesCount || 0)} Pedidos realizados
           </span>
           <ArrowRight size={16} className="text-slate-200 group-hover:text-blue-600 transition-all" />
        </div>
    </div>
  )
}
