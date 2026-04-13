'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Calculator,
  Settings,
  Store
} from 'lucide-react'

/**
 * PDV Conception v2.0 - Sapphire Sidebar
 * Modern SaaS lateral navigation with Sapphire Blue branding.
 */
export function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Vendas', icon: <ShoppingCart size={20} />, path: '/vendas' },
    { name: 'Estoque', icon: <Package size={20} />, path: '/estoque' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
    { name: 'Taxas', icon: <Calculator size={20} />, path: '/taxas' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/config' }
  ]

  return (
    <aside className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col pt-8 pb-10 border-r border-slate-800 shrink-0 hidden lg:flex">
      {/* Brand Station */}
      <div className="px-8 pb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Store size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight leading-none uppercase">Conception</h1>
            <span className="text-[10px] font-black text-blue-400 tracking-[0.2em] mt-1.5 block">SaaS v2.0</span>
          </div>
        </div>
      </div>

      {/* Nav Link Engine */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-700/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Session Zone */}
      <div className="px-6 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3 border border-slate-700/50">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-xs">
            IS
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white leading-tight">Ives Souza</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
