'use client'

import React from 'react'

interface MethodCompositionProps {
  data: {
    [key: string]: number
  }
}

/**
 * Sapphire v2.1 - MethodComposition
 * Horizontal percentage distribution of sales checkout.
 */
export function MethodComposition({ data }: MethodCompositionProps) {
  const methodEntries = Object.entries(data)
  const total = methodEntries.reduce((acc, [_, val]) => acc + val, 0)
  
  const getPercent = (val: number) => {
    if (total === 0) return 0
    return (val / total) * 100
  }

  const colors = [
    'bg-emerald-500', 
    'bg-blue-600', 
    'bg-orange-500', 
    'bg-indigo-500', 
    'bg-rose-500', 
    'bg-amber-500', 
    'bg-teal-500'
  ]

  const sections = methodEntries
    .map(([label, val], idx) => ({
      label,
      val,
      color: colors[idx % colors.length],
      percent: getPercent(val)
    }))
    .filter(s => s.percent > 0)
    .sort((a, b) => b.val - a.val)

  return (
    <div className="premium-card">
       <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Composição de Vendas</h3>
          <span className="text-[10px] font-bold text-slate-400 capitalize">Percentual do faturado</span>
       </div>

       <div className="space-y-8">
          {/* Main Visual Bar */}
          <div className="h-4 w-full bg-slate-50 border border-slate-100 rounded-full flex overflow-hidden shadow-inner">
             {sections.map(s => (
               <div 
                 key={s.label}
                 className={`${s.color} h-full transition-all duration-1000 ease-out`} 
                 style={{ width: `${s.percent}%` }}
               />
             ))}
          </div>

          {/* Legend Cluster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             {sections.map(s => (
                <div key={s.label} className="space-y-1">
                   <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${s.color}`} />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">{s.percent.toFixed(0)}%</span>
                      <span className="text-[10px] font-bold text-slate-400">R$ {s.val.toFixed(0)}</span>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  )
}
