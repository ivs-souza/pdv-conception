import './globals.css'
import './gravity.css' // High-performance Glassmorphism system
import type { Metadata, Viewport } from 'next'
import { NavSidebar } from '@/components/layout/NavSidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'PDV Conception | Gravity',
  description: 'Next-gen Point of Sale with Glassmorphism',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PDV Conception',
  },
}

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentRole: 'ADMIN' | 'SELLER' = 'ADMIN';

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className="bg-slate-950 text-slate-50 antialiased overflow-x-hidden font-gravity">
        <div id="gravity-root" className="flex min-h-screen">
          <NavSidebar role={currentRole} />
          
          <main className="flex-1 gravity-main transition-all duration-300 relative">
            {children}
            <Footer />
          </main>

          <BottomNav />
        </div>
      </body>
    </html>
  )
}
