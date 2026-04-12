import './globals.css'
import type { Metadata } from 'next'
import { NavSidebar } from '@/components/layout/NavSidebar'

export const metadata: Metadata = {
  title: 'PDV Conception - High Performance Checkout',
  description: 'Magazine style point of sale system for high-speed retail operations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In production, the role would be fetched from the session/token context
  const currentRole: 'ADMIN' | 'SELLER' = 'ADMIN';

  return (
    <html lang="pt-BR">
      <body>
        <div id="root-layout-wrapper" style={{ display: 'flex' }}>
          <NavSidebar role={currentRole} />
          <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', backgroundColor: '#f9fbfd' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
