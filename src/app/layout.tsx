import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import NavSidebar from '@/components/layout/NavSidebar'
import { ToastProvider } from '@/components/layout/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PDV Conception v2.0 | SaaS Premium',
  description: 'Sistema de Gestão Profissional Modular',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PDV Conception',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
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
  return (
    <html lang="pt-BR">
      <head>
         <link rel="manifest" href="/manifest.json" />
         <meta name="theme-color" content="#0F172A" />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <div className="flex bg-[#F8FAFC] min-h-screen text-slate-900">
            <NavSidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
