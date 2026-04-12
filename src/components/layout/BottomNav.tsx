'use client'

import React from 'react'
import { ShoppingCart, Package, Users, Settings } from 'lucide-react'

/**
 * Compact BottomNav - Gravity Style
 * Height: 60px | Icons: 20px
 * Fixed and translucent for PWA feel.
 */
export function BottomNav() {
  return (
    <nav className="gravity-bottom-nav px-6 lg:hidden shadow-2xl">
      <NavItem icon={<ShoppingCart size={20} />} label="Vender" active />
      <NavItem icon={<Package size={20} />} label="Estoque" />
      <NavItem icon={<Users size={20} />} label="Clientes" />
      <NavItem icon={<Settings size={20} />} label="Menu" />
    </nav>
  )
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
      active ? 'text-blue-400' : 'text-slate-500 opacity-60'
    }`}>
      {icon}
      <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
      {active && <div className="w-1 h-1 rounded-full bg-blue-400 mt-0.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
    </button>
  )
}
