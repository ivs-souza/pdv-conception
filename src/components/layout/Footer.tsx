'use client'

import React from 'react'
import { ShieldCheck } from 'lucide-react'

/**
 * Footer Component - Gravity Design
 * Sticky footer containing versioning and dynamic plan badges.
 */
export function Footer() {
  return (
    <footer className="fixed bottom-[72px] lg:bottom-0 left-0 right-0 h-10 flex items-center justify-between px-6 glass-panel border-t-0 lg:border-t text-[10px] font-black text-slate-500 z-40">
      <div className="flex items-center gap-3 tracking-widest uppercase">
        <span className="text-slate-400">PDV CONCEPTION v1.0.0</span>
        <span className="bg-slate-800 w-1 h-1 rounded-full" />
        <span>LIBERDADE-MG</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full">
          <ShieldCheck size={12} className="text-blue-400" />
          <span className="text-blue-400 uppercase tracking-tighter">USUÁRIO PRO</span>
        </div>
      </div>
    </footer>
  )
}
