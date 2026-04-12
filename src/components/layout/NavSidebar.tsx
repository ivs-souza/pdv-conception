'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  ShoppingCart,
  Zap
} from 'lucide-react'

interface NavSidebarProps {
  role: 'ADMIN' | 'SELLER'
}

/**
 * Glass Sidebar - Gravity Desktop UI
 * Ultra-modern, backdrop-blur design for larger screens.
 * Perfectly integrates with the Gravity Design System.
 */
export function NavSidebar({ role }: NavSidebarProps) {
  const pathname = usePathname()

  const links = [
    { name: 'Terminal PDV', path: '/dashboard', icon: <ShoppingCart size={20} />, role: ['ADMIN', 'SELLER'] },
    { name: 'Inventário', path: '/admin/inventory', icon: <Package size={20} />, role: ['ADMIN', 'SELLER'] },
    { name: 'Clientes', path: '/admin/customers', icon: <Users size={20} />, role: ['ADMIN', 'SELLER'] },
    { name: 'Métricas', path: '/admin/analytics', icon: <Zap size={20} />, role: ['ADMIN'] },
    { name: 'Configurações', path: '/admin/settings', icon: <Settings size={20} />, role: ['ADMIN'] },
  ]

  return (
    <aside className="gravity-sidebar flex flex-col h-screen sticky top-0 font-gravity">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center neon-glow">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-tight text-white">PDV CONCEPTION</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Gravity OS v1</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.filter(l => l.role.includes(role)).map((link) => {
            const isActive = pathname.startsWith(link.path)
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`}>
                  {link.icon}
                </span>
                <span className="text-sm font-bold tracking-tight">{link.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 neon-glow" />}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 glass-panel">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-blue-400 border border-blue-500/20">
            IS
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-wider">Ivan Souza</span>
            <span className="text-[10px] font-bold text-slate-500">{role}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
