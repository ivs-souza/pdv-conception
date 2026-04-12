'use client'

import React, { useState } from 'react'
import { VendasView } from '@/components/dashboard/VendasView'
import { CheckoutView } from '@/components/dashboard/CheckoutView'

/**
 * DashboardPage - Gravity Terminal
 * This is the heart of the PWA. It manages internal route-level views
 * to ensure a seamless "App" feeling without hard browser refreshes.
 */
export default function DashboardPage() {
  // Application View state for SPA/PWA feel
  const [activeView, setActiveView] = useState<'VENDAS' | 'CHECKOUT'>('VENDAS')

  return (
    <div className="relative min-h-screen">
      {/* Dynamic View Transition Engine */}
      <div className={`transition-all duration-500 ease-in-out ${
        activeView === 'VENDAS' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 absolute inset-0 pointer-events-none'
      }`}>
        <VendasView onProceed={() => setActiveView('CHECKOUT')} />
      </div>

      <div className={`transition-all duration-500 ease-in-out ${
        activeView === 'CHECKOUT' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 absolute inset-0 pointer-events-none'
      }`}>
        <CheckoutView onBack={() => setActiveView('VENDAS')} />
      </div>
    </div>
  )
}
