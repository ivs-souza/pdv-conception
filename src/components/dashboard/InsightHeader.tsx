'use client'

import React from 'react'
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'

interface InsightHeaderProps {
  stats: {
    lowStockCount: number
    vendasCount: number
  }
}

/**
 * Sapphire v2.0 - InsightHeader
 * The "Brain" of the command center.
 * Features the "Insight do Dia" and urgency pulse for low stock.
 */
export function InsightHeader({ stats }: InsightHeaderProps) {
  const needsRestock = stats.lowStockCount > 5

  return (
    <div className="space-y-4 mb-10 animate-fade-in">
      {/* Insight Hub Card */}
      <div className="premium-card bg-emerald-50/30 border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 px-10 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
           <Sparkles size={120} className="text-emerald-600" />
        </div>
        
        <div className="flex items-start gap-4 z-10">
           <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-700/20">
              <TrendingUp size={24} />
           </div>
           <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Insight do Dia</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-lg font-medium">
                 Suas vendas hoje estão <span className="text-emerald-600 font-extrabold">15% acima</span> da média da última segunda-feira. 
                 Excelente ritmo para o início da semana!
              </p>
           </div>
        </div>

        {/* Low Stock Urgency Pulse */}
        {needsRestock && (
          <div className="z-10 bg-white/80 backdrop-blur-md border border-red-100 p-4 rounded-2xl flex items-center gap-4 animate-pulse-soft shadow-xl shadow-red-500/5">
             <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle size={20} />
             </div>
             <div>
                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Urgência</span>
                <span className="text-xs font-bold text-slate-900">{stats.lowStockCount} Itens em Falta</span>
             </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulseSoft {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.1); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-pulse-soft {
          animation: pulseSoft 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
