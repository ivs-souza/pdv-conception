'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu,
  X,
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Calculator,
  Settings,
  Gem,
  BookOpen
} from 'lucide-react'
import { SettingsService } from '@/services/settings.service'

import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [companyName, setCompanyName] = useState('Sapphire')
  const { user, userData, logout } = useAuth()

  useEffect(() => {
    if (!userData?.unidade) return
    SettingsService.getSettings(userData.unidade).then(settings => {
      setCompanyName(settings.store?.name || userData.unidade)
    })
  }, [userData?.unidade])

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Vendas', icon: <ShoppingCart size={20} />, path: '/vendas' },
    { name: 'Crediário', icon: <BookOpen size={20} />, path: '/crediario' },
    { name: 'Estoque', icon: <Package size={20} />, path: '/estoque' },
    { name: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
    { name: 'Taxas', icon: <Calculator size={20} />, path: '/taxas' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes' }
  ]

  // Only render if logged in
  if (!user) return null

  return (
    <>
      {/* Top Navbar */}
      <div className="lg:hidden sticky top-0 z-[150] w-full bg-slate-900 border-b border-slate-800 px-4 py-4 flex items-center justify-between shadow-lg relative">
         <button 
           onClick={() => setIsOpen(true)}
           className="text-white p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors z-10"
         >
            <Menu size={24} />
         </button>
         
         {/* Centralized Logo */}
         <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Gem size={16} />
            </div>
            <h1 className="font-black text-white tracking-widest uppercase text-sm">SAPPHIRE</h1>
         </div>

         {/* Spacer to balance the flex layout */}
         <div className="w-10"></div>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-[170] w-72 bg-slate-900 shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
         <header className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex flex-col min-w-0">
               <h1 className="font-black text-lg text-white tracking-widest uppercase leading-none flex items-center gap-2">
                 <Gem size={18} className="text-blue-500" />
                 SAPPHIRE
               </h1>
               <span className="text-[10px] font-light text-slate-400 mt-1 tracking-tight truncate uppercase ml-7">
                 {companyName}
               </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-full transition-colors"
            >
               <X size={20} />
            </button>
         </header>

         <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-semibold text-sm ${
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

         <div className="p-6 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-sm shrink-0 overflow-hidden">
                 {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    user?.displayName?.split(' ').map((n: string) => n[0]).join('') || 'OP'
                 )}
               </div>
               <div className="flex flex-col min-w-0">
                 <span className="text-sm font-bold text-white leading-tight truncate">
                    {userData?.nome || user?.displayName || 'Operador'}
                 </span>
                 <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{userData?.unidade || 'Filial'}</span>
               </div>
            </div>
            <button 
               onClick={logout}
               className="text-slate-500 hover:text-red-500 transition-colors p-2"
            >
               <LogOut size={20} />
            </button>
         </div>
      </div>
    </>
  )
}
