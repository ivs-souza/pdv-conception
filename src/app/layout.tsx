import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNavbar } from '@/components/layout/MobileNavbar'
import { ToastProvider } from '@/components/layout/Toast'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'



export const metadata: Metadata = {
  title: 'Sapphire | Intelligent Retail',
  description: 'Sistema de Gestão Profissional Modular Sapphire',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sapphire',
    startupImage: [
      {
        url: '/icon-512x512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
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
            <AuthProvider>
              <div className="flex flex-col lg:flex-row bg-[#F8FAFC] min-h-screen text-slate-900">
                <MobileNavbar />
                <Sidebar />
                <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
                  {children}
                </main>
              </div>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
