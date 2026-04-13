'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Smartphone, Settings } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Sapphire v2.1 - Global Resilience Station
 * Catches initialization errors and provides a professional fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PDV Global Error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      const isFirebaseError = this.state.error?.message.includes('collection()') || 
                             this.state.error?.message.includes('apiKey')

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden">
             
             {/* Background Glow */}
             <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[100px]" />
             <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/20 blur-[100px]" />

             <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                <AlertCircle size={40} className="text-blue-500" />
             </div>

             <h1 className="text-2xl font-black tracking-tighter mb-4">
                {isFirebaseError ? 'Configuração Pendente' : 'Ops! Algo deu errado'}
             </h1>
             
             <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                {isFirebaseError 
                  ? 'Não conseguimos conectar ao banco de dados. Verifique se as variáveis de ambiente (API_KEY) foram configuradas no build.' 
                  : 'Encontramos um erro inesperado durante a renderização inicial. Tente recarregar a aplicação.'}
             </p>

             <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40"
                >
                   <RefreshCw size={16} /> RECARREGAR APP
                </button>
                
                <a 
                  href="https://console.firebase.google.com" 
                  target="_blank"
                  className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                >
                   <Settings size={16} /> VERIFICAR CONSOLE
                </a>
             </div>

             <div className="mt-10 pt-8 border-t border-slate-700/50 flex items-center justify-center gap-2 opacity-30">
                <Smartphone size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sapphire Resilience Engine</span>
             </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
