'use client'

import React, { useState } from 'react'
import { CartList } from '@/components/checkout/CartList'
import { CheckoutSidebar } from '@/components/checkout/Sidebar'
import { SearchPalette } from '@/components/ui/SearchPalette'
import { RoleWrapper } from '@/components/auth/RoleWrapper'
import { useCart } from '@/hooks/useCart'

/**
 * DashboardPage - PDV Conception
 * Main Sales Terminal featuring high-UX checkout and role-based metrics.
 * CNN/Magazine Style aesthetics with Slate-900 contrast.
 */
export default function DashboardPage() {
  // Mocking roles and user context for the demo
  const [userRole, setUserRole] = useState<'ADMIN' | 'SELLER'>('ADMIN')
  const { items, total, addItem, updatePrice, updateQuantity, removeItem } = useCart()

  return (
    <div className="pdv-dashboard">
      {/* Header Station */}
      <header className="station-header">
        <div className="brand-zone">
          <h1 className="font-black">PDV CONCEPTION</h1>
          <span className="version font-medium">STATION v1.0.0</span>
        </div>
        
        <div className="operator-zone">
          <div className="operator-info">
            <span className="label font-bold">OPERADOR:</span>
            <span className="val font-medium">{userRole === 'ADMIN' ? 'IVAN SOUZA (ADM)' : 'VENDEDOR MOCK'}</span>
          </div>
          <button 
            className="role-toggle btn-primary"
            onClick={() => setUserRole(r => r === 'ADMIN' ? 'SELLER' : 'ADMIN')}
          >
            SIMULAR TROCA DE CARGO [F8]
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Admin Secret Widget - Performance */}
        <RoleWrapper role={userRole} allowedRoles={['ADMIN']}>
          <div className="admin-widget magazine-card">
            <div className="widget-icon">⚡</div>
            <div className="widget-details">
              <span className="widget-label font-black">MÉTRICA DE PERFORMANCE DO DIA</span>
              <div className="widget-values">
                <div className="metric">
                  <span className="m-label font-bold">BRUTO:</span>
                  <span className="m-val font-black">R$ 14.502,30</span>
                </div>
                <div className="metric">
                  <span className="m-label font-bold">MARGEM:</span>
                  <span className="m-val font-black color-emerald">22.4%</span>
                </div>
              </div>
            </div>
          </div>
        </RoleWrapper>

        {/* High-Speed Search Engine */}
        <SearchPalette onSelect={addItem} />

        {/* 70/30 Split Layout */}
        <div className="checkout-layout">
          <div className="checkout-main">
            <CartList 
              items={items} 
              onUpdateQuantity={updateQuantity} 
              onUpdatePrice={updatePrice} 
              onRemove={removeItem}
            />
          </div>
          
          <aside className="checkout-aside">
            <CheckoutSidebar 
              total={total} 
              client={{
                name: 'Joaquim Silva',
                creditLimit: 5000,
                currentBalance: 1250.40
              }}
            />
          </aside>
        </div>
      </main>

      <style jsx>{`
        .pdv-dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .station-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          background: white;
          border-bottom: 4px solid var(--slate-900);
        }
        .brand-zone h1 {
          font-size: 1.5rem;
          color: var(--slate-900);
        }
        .version {
          font-size: 0.65rem;
          color: var(--slate-900);
          opacity: 0.5;
        }
        .operator-info {
          display: flex;
          gap: 0.5rem;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }
        .role-toggle {
          font-size: 0.65rem;
          padding: 0.4rem 0.8rem;
          border-radius: 2px;
        }
        .main-content {
          flex: 1;
          padding: 2rem 2.5rem;
        }
        .admin-widget {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-left: 8px solid var(--emerald-600);
        }
        .widget-icon {
          font-size: 2rem;
        }
        .widget-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .widget-label {
          font-size: 0.75rem;
          color: var(--slate-900);
          opacity: 0.6;
        }
        .widget-values {
          display: flex;
          gap: 2rem;
          margin-top: 0.5rem;
        }
        .metric {
          display: flex;
          gap: 0.5rem;
          align-items: baseline;
        }
        .m-label {
          font-size: 0.7rem;
        }
        .m-val {
          font-size: 1.25rem;
        }
        .color-emerald {
          color: var(--emerald-600);
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 2.5rem;
          align-items: start;
        }
        .checkout-main {
          min-width: 0;
        }
      `}</style>
    </div>
  )
}
