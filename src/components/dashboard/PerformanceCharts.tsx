'use client'

import React from 'react'
import { 
  BarChart, 
  TrendingUp, 
  Package, 
  Layers 
} from 'lucide-react'

/**
 * PDV Conception v2.0 - PerformanceCharts
 * SVG Line Chart (Weekly) + CSS Bar Chart (Categories)
 * Aesthetic: Sapphire SaaS Professional
 */
export function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Weekly Sales (SVG Line) */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-50 text-blue-600 rounded-lg">
                <TrendingUp size={18} />
             </div>
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Faturamento Semanal</h3>
          </div>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md tracking-widest uppercase">Últimos 7 dias</span>
        </div>

        <div className="relative h-64 w-full">
          <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
             <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                   <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
             </defs>
             {/* Gradient Area */}
             <path 
               d="M0 40 L0 32 L15 28 L30 35 L50 15 L70 20 L85 10 L100 12 L100 40 Z" 
               className="fill-[url(#chart-grad)] transition-all duration-1000" 
             />
             {/* Smooth Sapphire Line */}
             <path 
               d="M0 32 L15 28 L30 35 L50 15 L70 20 L85 10 L100 12" 
               className="stroke-blue-600 stroke-[2] fill-none stroke-linecap-round stroke-linejoin-round"
               style={{ filter: "drop-shadow(0 4px 6px rgba(37, 99, 235, 0.1))" }}
             />
          </svg>
          <div className="flex justify-between mt-6 px-1">
             {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map(day => (
               <span key={day} className="text-[10px] font-black text-slate-400 tracking-tighter">{day}</span>
             ))}
          </div>
        </div>
      </div>

      {/* Category Ranking (CSS Bars) */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 text-blue-600 rounded-lg">
                 <Layers size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Top Categorias</h3>
           </div>
           <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
              <BarChart size={18} />
           </button>
        </div>

        <div className="space-y-6">
           <CategoryBar label="Bebidas" value={65} color="bg-blue-600" amount="R$ 1.250" />
           <CategoryBar label="Vestuário" value={42} color="bg-blue-400" amount="R$ 840" />
           <CategoryBar label="Eletrônicos" value={28} color="bg-slate-800" amount="R$ 420" />
           <CategoryBar label="Acessórios" value={15} color="bg-slate-400" amount="R$ 180" />
        </div>
      </div>
    </div>
  )
}

function CategoryBar({ label, value, color, amount }: { label: string, value: number, color: string, amount: string }) {
  return (
    <div className="space-y-2 group">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-slate-500 group-hover:text-blue-600 transition-colors">{label}</span>
          <span className="text-slate-900">{amount}</span>
       </div>
       <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} 
            style={{ width: `${value}%` }} 
          />
       </div>
    </div>
  )
}
