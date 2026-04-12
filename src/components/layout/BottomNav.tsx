'use client'

import React from 'react'
import { ShoppingCart, Package, Users, Settings, LayoutDashboard } from 'lucide-react'

/**
 * BottomNav Component - Gravity Architecture
 * Essential for the PWA experience on mobile.
 * Features ultra-bold typography and neon active states.
 */
export function BottomNav() {
  return (
    <nav className="gravity-bottom-nav px-8 flex items-center justify-between lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">
      <NavItem icon={<LayoutDashboard size={22} />} label="Vender" active />
      <NavItem icon={<Package size={22} />} label="Estoque" />
      <NavItem icon={<Users size={22} />} label="Clientes" />
      <NavItem icon={<Settings size={22} />} label="Menu" />
    </nav>
  )
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active = false }: NavItemProps) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
      active ? 'text-neon scale-110' : 'text-slate-500 opacity-60'
    }`}>
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      {active && <div className="w-1 h-1 rounded-full bg-blue-400 neon-glow" />}
    </button>
  )
}
