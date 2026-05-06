'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Wallet, Search, TrendingUp, AlertTriangle, CheckCircle2, Trash2, CalendarClock, Lock } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/utils/firebase'
import { collection, onSnapshot, query, orderBy, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore'
import { CustomerDebtCard } from '@/components/financial/CustomerDebtCard'
import { CustomerDebtDrawer } from '@/components/financial/CustomerDebtDrawer'
import { FinancialService } from '@/services/financial.service'
import { CashService } from '@/services/cash.service'
import { SettingsService } from '@/services/settings.service'
import { formatCurrency } from '@/utils/format'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'
import { where } from 'firebase/firestore'

type FilterType = 'all' | 'overdue' | 'upcoming'

export default function CrediarioPage() {
  const { userData } = useAuth()
  const [installments, setInstallments] = useState<any[]>([])
  const [validSaleIds, setValidSaleIds] = useState<Set<string>>(new Set())
  const [salesLoaded, setSalesLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedCustomerDebt, setSelectedCustomerDebt] = useState<any | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const { showToast } = useToast()

  // ── Listener 0: Cash Register State ──
  useEffect(() => {
    if (!userData?.unidade) return
    const unsubscribe = CashService.subscribeToCurrentRegister(userData.unidade, userData.uid, (register) => {
       setIsRegisterOpen(!!register)
    })
    return () => unsubscribe()
  }, [userData?.unidade])

  // ── Listener 1: All installments (contas_a_receber) ──
  useEffect(() => {
    if (!db || !userData?.unidade) return
    const q = query(
      collection(db, "contas_a_receber"), 
      where("unidade", "==", userData.unidade),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const docs = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }))

      const enrichedDocs = docs.map((d: any) => {
        if (d.status === 'PAID') return { ...d, statusValue: 3 }
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = parseSafeDate(d.dueDate)
        const isOverdue = today > dueDate
        return { ...d, statusValue: isOverdue ? 0 : 1, parsedDueDate: dueDate }
      })

      setInstallments(enrichedDocs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userData?.unidade])

  // ── Listener 2: Track valid sale IDs for orphan filtering ──
  useEffect(() => {
    if (!db || !userData?.unidade) return
    const q = query(collection(db, "vendas"), where("unidade", "==", userData.unidade))
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const ids = new Set<string>(snapshot.docs.map((d: any) => d.id as string))
      setValidSaleIds(ids)
      setSalesLoaded(true)
    })
    return () => unsubscribe()
  }, [userData?.unidade])

  // ── Safe date parser ──
  function parseSafeDate(dueDateStr: string): Date {
    if (!dueDateStr) return new Date()
    if (/^\d{4}-\d{2}-\d{2}T/.test(dueDateStr)) return new Date(dueDateStr)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dueDateStr)) {
      const [y, m, d] = dueDateStr.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    return new Date(dueDateStr)
  }

  // ── Filter orphaned installments ──
  const validInstallments = useMemo(() => {
    if (!salesLoaded) return installments
    return installments.filter(inst => {
      if (!inst.saleId) return false
      return validSaleIds.has(inst.saleId)
    })
  }, [installments, validSaleIds, salesLoaded])

  // ── Group by Client ──
  const groupedCustomers = useMemo(() => {
    const map = new Map<string, any>()
    
    validInstallments.forEach(inst => {
      if (inst.status === 'PAID' || inst.status === 'PAGO') return // Only group active debt

      const key = inst.clientId || inst.clientName || 'unknown'
      if (!map.has(key)) {
        map.set(key, {
          clientId: inst.clientId || key,
          clientName: inst.clientName || 'Desconhecido',
          clientPhone: inst.clientPhone || '',
          totalDebt: 0,
          overdueCount: 0,
          nearestDueDate: null,
          installments: []
        })
      }

      const group = map.get(key)
      group.installments.push(inst)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dueDate = inst.parsedDueDate || parseSafeDate(inst.dueDate)
      
      let lateFee = 0
      if (today > dueDate) {
        group.overdueCount++
        lateFee = FinancialService.calculateLateFee(inst.dueDate, inst.value)
      }
      
      group.totalDebt += (inst.value + lateFee)

      if (!group.nearestDueDate || dueDate < group.nearestDueDate) {
        group.nearestDueDate = dueDate
      }
    })

    return Array.from(map.values())
  }, [validInstallments])

  // Update selected customer debt if it's open, so drawer updates automatically when payments are made
  useEffect(() => {
     if (selectedCustomerDebt) {
        const updated = groupedCustomers.find(c => c.clientId === selectedCustomerDebt.clientId)
        if (updated) {
           setSelectedCustomerDebt(updated)
        } else {
           // Debt fully paid, close drawer automatically
           setSelectedCustomerDebt(null)
        }
     }
  }, [groupedCustomers])

  // ── Apply UI Filters ──
  const filteredCustomers = useMemo(() => {
     let filtered = groupedCustomers

     if (searchTerm) {
        const term = searchTerm.toLowerCase()
        filtered = filtered.filter(c => c.clientName.toLowerCase().includes(term))
     }

     if (activeFilter === 'overdue') {
        filtered = filtered.filter(c => c.overdueCount > 0)
        // Sort by oldest due date first (most urgent)
        filtered.sort((a, b) => {
           const dateA = a.nearestDueDate ? a.nearestDueDate.getTime() : Infinity
           const dateB = b.nearestDueDate ? b.nearestDueDate.getTime() : Infinity
           return dateA - dateB
        })
     } else if (activeFilter === 'upcoming') {
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        filtered = filtered.filter(c => c.nearestDueDate && c.nearestDueDate <= nextWeek && c.overdueCount === 0)
        filtered.sort((a, b) => {
           const dateA = a.nearestDueDate ? a.nearestDueDate.getTime() : Infinity
           const dateB = b.nearestDueDate ? b.nearestDueDate.getTime() : Infinity
           return dateA - dateB
        })
     } else {
        // 'all'
        filtered.sort((a, b) => {
           // Overdue first
           if (a.overdueCount > 0 && b.overdueCount === 0) return -1
           if (b.overdueCount > 0 && a.overdueCount === 0) return 1
           // Then by nearest due date
           const dateA = a.nearestDueDate ? a.nearestDueDate.getTime() : Infinity
           const dateB = b.nearestDueDate ? b.nearestDueDate.getTime() : Infinity
           return dateA - dateB
        })
     }

     return filtered
  }, [groupedCustomers, searchTerm, activeFilter])


  // ── Stats (KPIs) ──
  const stats = useMemo(() => {
    let toReceive = 0
    let overdueCount = 0
    let paidAmount = 0

    validInstallments.forEach(inst => {
      if (inst.status === 'PAID') {
        paidAmount += (inst.paidAmount || inst.value)
      } else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = inst.parsedDueDate || parseSafeDate(inst.dueDate)
        if (today > dueDate) {
          overdueCount++
          toReceive += inst.value + FinancialService.calculateLateFee(inst.dueDate, inst.value)
        } else {
          toReceive += inst.value
        }
      }
    })

    return { toReceive, overdueCount, paidAmount }
  }, [validInstallments])

  // ── 🧹 LIMPEZA TOTAL DE DADOS ──
  const handleClearAllData = async () => {
    if (!db) return
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Isso irá deletar TODAS as vendas e parcelas do banco de dados.\n\nEsta ação é IRREVERSÍVEL. Continuar?'
    )
    if (!confirmed) return

    if (!userData?.unidade) return
    setIsClearing(true)
    try {
      await SettingsService.clearDatabase(userData.unidade)
      showToast(`✅ Registros da unidade deletados com sucesso.`, "success")
      setTimeout(() => window.location.reload(), 1500)
    } catch (e: any) {
      console.error("Cleanup Error:", e)
      showToast("Erro ao limpar dados: " + e.message, "error")
      setIsClearing(false)
    }
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Gestão de Crediário</h2>
          </div>
          <p className="text-muted font-medium ml-11">Controle de recebimentos, atrasos e fluxo de parcelas.</p>
        </div>
        <button
          onClick={handleClearAllData}
          disabled={isClearing}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50"
        >
          <Trash2 size={14} />
          {isClearing ? 'Limpando...' : 'Limpar Dados de Teste'}
        </button>
      </header>

      {/* Warning Banner: Closed Register */}
      {!isRegisterOpen && !loading && (
        <div className="bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                 <Lock size={24} />
              </div>
              <div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tight">Caixa Fechado</h3>
                 <p className="text-sm font-medium text-slate-500">É necessário abrir o caixa para realizar recebimentos ou baixas de parcelas.</p>
              </div>
           </div>
           <Link 
             href="/caixa"
             className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2 active:scale-95 shrink-0 whitespace-nowrap"
           >
             Abrir Meu Turno agora
           </Link>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center gap-5">
          <div className={`p-3 bg-blue-50 text-blue-600 rounded-xl ${loading ? 'animate-pulse' : ''}`}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">A Receber Total</p>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">
              {loading ? '---' : formatCurrency(stats.toReceive)}
            </h4>
          </div>
        </div>
        <div className="premium-card p-6 flex items-center gap-5">
          <div className={`p-3 bg-emerald-50 text-emerald-600 rounded-xl ${loading ? 'animate-pulse' : ''}`}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Recebido</p>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">
              {loading ? '---' : formatCurrency(stats.paidAmount)}
            </h4>
          </div>
        </div>
        <div className="premium-card p-6 flex items-center gap-5">
          <div className={`p-3 bg-red-50 text-red-600 rounded-xl ${loading ? 'animate-pulse' : ''}`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Parcelas em Atraso</p>
            <h4 className={`text-xl font-black tracking-tight ${stats.overdueCount > 0 ? 'text-red-500' : 'text-slate-900'}`}>
              {loading ? '---' : stats.overdueCount} Contas
            </h4>
          </div>
        </div>
      </div>

      {/* Tab Bar + Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Filters */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shrink-0 overflow-x-auto w-full md:w-auto custom-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Todos ({groupedCustomers.length})
          </button>
          <button
            onClick={() => setActiveFilter('overdue')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === 'overdue'
                ? 'bg-white text-red-500 shadow-sm'
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <AlertTriangle size={14} />
            Em Atraso
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeFilter === 'upcoming'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-400 hover:text-blue-500'
            }`}
          >
            <CalendarClock size={14} />
            Próximos Venc.
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm placeholder:font-medium"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customerDebt) => (
            <CustomerDebtCard 
               key={customerDebt.clientId} 
               customerDebt={customerDebt} 
               onClick={() => setSelectedCustomerDebt(customerDebt)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 border border-slate-100 rounded-3xl backdrop-blur-sm">
           <CheckCircle2 size={48} className="text-emerald-300 mb-4" />
           <span className="text-sm font-bold uppercase tracking-widest text-slate-400">
             {searchTerm ? 'Nenhum cliente encontrado.' : 'Tudo limpo! Nenhuma dívida pendente 🎉'}
           </span>
        </div>
      )}

      </div>

      {/* Drawer */}
      <CustomerDebtDrawer 
        customerDebt={selectedCustomerDebt} 
        isRegisterOpen={isRegisterOpen}
        onClose={() => setSelectedCustomerDebt(null)} 
      />
    </>
  )
}
