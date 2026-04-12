'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * NavSidebar Component
 * Implements the global navigation in "Magazine" style.
 * Features ultra-bold typography and high-contrast active states.
 */
export function NavSidebar({ role }: { role: 'ADMIN' | 'SELLER' }) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'VENDAS', href: '/dashboard', roles: ['ADMIN', 'SELLER'] },
    { label: 'ESTOQUE', href: '/admin/inventory', roles: ['ADMIN', 'SELLER'] },
    { label: 'CLIENTES', href: '/admin/customers', roles: ['ADMIN', 'SELLER'] },
    { label: 'ANALYSIS', href: '/admin/analytics', roles: ['ADMIN'] },
    { label: 'CONFIGS', href: '/admin/settings', roles: ['ADMIN'] },
  ];

  return (
    <aside className="nav-sidebar">
      <div className="sidebar-header">
        <h1 className="font-black">PDV</h1>
        <div className="badge font-bold">2026</div>
      </div>

      <nav className="nav-links">
        {menuItems
          .filter(item => item.roles.includes(role))
          .map(item => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`nav-item font-black ${pathname.startsWith(item.href) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-role font-bold">{role}</div>
      </div>

      <style jsx>{`
        .nav-sidebar {
          width: 240px;
          height: 100vh;
          background: var(--slate-900);
          color: white;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .sidebar-header {
          margin-bottom: 4rem;
        }

        .sidebar-header h1 {
          font-size: 2.5rem;
          line-height: 0.8;
          margin-bottom: 0.5rem;
        }

        .badge {
          font-size: 0.7rem;
          background: var(--red-600);
          display: inline-block;
          padding: 0.1rem 0.4rem;
        }

        .nav-links {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          flex-grow: 1;
        }

        .nav-item {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: 0.2s;
          letter-spacing: -0.02em;
        }

        .nav-item:hover, .nav-item.active {
          color: white;
          transform: translateX(5px);
        }

        .nav-item.active {
          position: relative;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          left: -2rem;
          top: 50%;
          width: 8px;
          height: 24px;
          background: var(--red-600);
          transform: translateY(-50%);
        }

        .sidebar-footer {
          margin-top: auto;
          font-size: 0.7rem;
          opacity: 0.3;
          letter-spacing: 0.1em;
        }
      `}</style>
    </aside>
  )
}
