'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-slide-up ${
              t.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
              t.type === 'error' ? 'bg-red-600 border-red-500 text-white' : 
              'bg-slate-900 border-slate-800 text-white'
            }`}
          >
             {t.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
             <span className="text-sm font-bold tracking-tight">{t.message}</span>
             <button onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
                <X size={14} />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
