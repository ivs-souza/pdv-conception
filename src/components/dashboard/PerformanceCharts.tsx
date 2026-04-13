'use client'

import React from 'react'
import { 
  BarChart, 
  TrendingUp, 
  Layers 
} from 'lucide-react'
import { formatCurrency } from '@/utils/format'

interface PerformanceChartsProps {
  weeklyPerformance?: number[]
  categoryRanking?: any[]
}

/**
 * Sapphire v3.1 - PerformanceCharts
 * Dynamic SVG Bezier Chart (Weekly) + CSS Bar Chart (Categories)
 * Aesthetic: Sapphire SaaS Professional
 */
export function PerformanceCharts({ 
  weeklyPerformance = [0, 0, 0, 0, 0, 0, 0], 
  categoryRanking = [] 
}: PerformanceChartsProps) {
  
  // BI Logic: Generate smooth Bezier curve Path
  const generatePath = (data: number[], isArea: boolean = false) => {
    if (!data || data.length === 0) return ''
    const max = Math.max(...data, 100)
    const points = data.map((val, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: 40 - (val / max) * 35 // Leave some padding at top
    }))

    let d = `M ${points[0].x} ${points[0].y}`
    
    // Smooth Bezier Curve logic
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cp1x = p0.x + (p1.x - p0.x) / 2
      const cp1y = p0.y
      const cp2x = p0.x + (p1.x - p0.x) / 2
      const cp2y = p1.y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`
    }

    if (isArea) {
      d += ` L 100 40 L 0 40 Z`
    }
    return d
  }

  const linePath = generatePath(weeklyPerformance)
  const areaPath = generatePath(weeklyPerformance, true)

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
               d={areaPath} 
               className="fill-[url(#chart-grad)] transition-all duration-1000" 
             />
             {/* Smooth Sapphire Line (Bezier) */}
             <path 
               d={linePath} 
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
           {categoryRanking.length > 0 ? (
             categoryRanking.map((cat, idx) => (
               <CategoryBar 
                 key={cat.label} 
                 label={cat.label} 
                 value={cat.percentage} 
                 color={idx === 0 ? "bg-blue-600" : "bg-slate-400"} 
                 amount={formatCurrency(cat.amount)} 
               />
             ))
           ) : (
             <div className="py-20 text-center text-slate-300 italic text-sm font-bold uppercase tracking-widest">
                Nenhuma venda registrada
             </div>
           )}
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
