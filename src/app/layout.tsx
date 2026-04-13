import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider } from '@/components/layout/Toast'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'



export const metadata: Metadata = {
  title: 'Sapphire | Intelligent Retail',
  description: 'Sistema de Gestão Profissional Modular Sapphire',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sapphire',
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
      <body>
        <ErrorBoundary>
          <ToastProvider>
            <div className="flex bg-[#F8FAFC] min-h-screen text-slate-900">
              <Sidebar />
              <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
                {children}
              </main>
            </div>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
