'use client'

import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Lock,
  Send
} from 'lucide-react'
import { AnalyticsService } from '@/services/analytics.service'
import { SettingsService } from '@/services/settings.service'
import { InsightHeader } from '@/components/dashboard/InsightHeader'
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { CashFlowGrid } from '@/components/dashboard/CashFlowGrid'
import { MethodComposition } from '@/components/dashboard/MethodComposition'
import { DebtorsList } from '@/components/dashboard/DebtorsList'
import { formatCurrency } from '@/utils/format'

/**
 * Sapphire v2.1 - The Command Center
 * Hub de Inteligência, Fluxo de Caixa e Resultados.
 */
export default function DashboardHome() {
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('MONTH')
  const [stats, setStats] = useState<any>({
    totalFaturamento: 0,
    totalLucro: 0,
    ticketMedio: 0,
    lowStockCount: 0,
    vendasCount: 0,
    byMethod: { DINHEIRO: 0, ELECTRONIC: 0, FIADO: 0 }
  })
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [debtors, setDebtors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFullData = async () => {
    setLoading(true)
    const [s, d] = await Promise.all([
      AnalyticsService.getQuickStats(period),
      AnalyticsService.getTopDebtors()
    ])
    setStats(s)
    setDebtors(d)
    setLoading(false)
  }

  useEffect(() => {
    fetchFullData()
    
    // Safety Fallback: Force loading to false after 5 seconds to prevent UI freeze
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false)
        console.warn("⏱️ Sync Timeout: Verifique sua conexão ou permissões do banco.")
      }
    }, 5000)

    const unsubscribe = AnalyticsService.subscribeToRecentSales((sales) => {
      setRecentSales(sales)
    })
    
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [period])

  const handleCloseDay = async () => {
    if (!stats) return
    const settings = await SettingsService.getSettings()
    
    // Summary building for the [Resumo] placeholder
    const resumo = `💵 Dinheiro: R$ ${(stats?.byMethod?.DINHEIRO || 0).toFixed(2)} | 💳 Digital: R$ ${(stats?.byMethod?.ELECTRONIC || 0).toFixed(2)} | 📒 Fiado: R$ ${(stats?.byMethod?.FIADO || 0).toFixed(2)} | 💰 TOTAL: R$ ${(stats?.totalFaturamento || 0).toFixed(2)}`
    
    let messageBody = settings.store.whatsappTemplate
      .replace('[Nome do Cliente]', 'Administrador')
      .replace('[Nome da Loja]', settings.store.name)
      .replace('[Resumo]', resumo)

    const message = encodeURIComponent(messageBody)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

/* Removed loading guard to support Optimistic UI (rendering 0/--- immediately) */

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Dynamic Command Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
         <InsightHeader stats={stats} />
         
         <div className="flex items-center gap-4 bg-white p-2 border border-slate-100 rounded-2xl shadow-sm self-start">
            <Filter size={16} className="ml-2 text-slate-400" />
            {(['TODAY', 'WEEK', 'MONTH'] as const).map(p => (
               <button 
                 key={p}
                 onClick={() => setPeriod(p)}
                 className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                   period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                  {p === 'TODAY' ? 'Hoje' : p === 'WEEK' ? '7 Dias' : '30 Dias'}
               </button>
            ))}
            <div className="w-[1px] h-6 bg-slate-100 mx-2" />
            <button 
              onClick={handleCloseDay}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all"
            >
               <Lock size={14} /> Fechar Dia
            </button>
         </div>
      </div>

      {/* KPI Core Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIItem 
           label="Faturamento Total" 
           value={formatCurrency(stats?.totalFaturamento)} 
           sublabel="Receita bruta no período"
           icon={<DollarSign size={20} />} 
           color="blue"
        />
        <KPIItem 
           label="Lucro Estimado" 
           value={formatCurrency(stats?.totalLucro)} 
           sublabel="Margem real (v3.1)"
           icon={<TrendingUp size={20} />} 
           color="emerald"
        />
        <KPIItem 
           label="Segmento Campeão" 
           value={stats?.topCategory || '---'} 
           sublabel={`${stats?.vendasCount || 0} vendas realizadas`}
           icon={<Target size={20} />} 
           color="slate"
        />
        <KPIItem 
           label="Estoque Crítico" 
           value={`${stats?.lowStockCount || 0} Itens`} 
           sublabel="Abaixo do ressuprimento"
           icon={<AlertTriangle size={20} />} 
           color={(stats?.lowStockCount || 0) > 5 ? "red" : "orange"}
        />
      </div>

      {/* Cash Flow Station */}
      <CashFlowGrid data={stats?.byMethod || { DINHEIRO: 0, ELECTRONIC: 0, FIADO: 0 }} />

      {/* Analytics Station (Charts & Feed) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         <div className="xl:col-span-3 space-y-8">
            <MethodComposition data={stats?.byMethod || { DINHEIRO: 0, ELECTRONIC: 0, FIADO: 0 }} />
            <PerformanceCharts 
              weeklyPerformance={stats?.weeklyPerformance}
              categoryRanking={stats?.categoryRanking}
            />
         </div>
         <div className="xl:col-span-1 space-y-8">
            <DebtorsList debtors={debtors} />
            <ActivityFeed sales={recentSales} />
         </div>
      </div>
    </div>
  )
}

function KPIItem({ label, value, sublabel, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-50 text-slate-500',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  }

  return (
    <div className="premium-card group relative overflow-hidden transition-all duration-500">
       <div className="flex items-start justify-between relative z-10">
          <div className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 ${colors[color]}`}>
             {icon}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
             <ArrowUpRight size={14} /> +8.2%
          </div>
       </div>

       <div className="mt-8 relative z-10">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
          <h4 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tighter">{value}</h4>
          <p className="text-[11px] font-medium text-slate-400 mt-1">{sublabel}</p>
       </div>
    </div>
  )
}
