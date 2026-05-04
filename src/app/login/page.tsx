'use client'

import React, { useState } from 'react'
import { auth } from '@/utils/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { Gem, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/layout/Toast'
import { useAuth } from '@/contexts/AuthContext'
import { User as UserIcon } from 'lucide-react'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()
  const { signUp } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return

    setLoading(true)
    try {
      if (isRegister) {
        await signUp(email, password, name)
        showToast("Conta criada com sucesso!", "success")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        showToast("Acesso concedido. Bem-vindo ao Sapphire!", "success")
      }
      router.push('/')
    } catch (error: any) {
      console.error("Auth Error:", error)
      const msg = isRegister ? "Erro ao criar conta. Verifique os dados." : "E-mail ou senha incorretos."
      showToast(msg, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] flex items-center justify-center p-4 z-[200]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] animate-scale-in relative">
        {/* Brand Station */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mb-6 animate-bounce-subtle">
            <Gem size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">
            SAPPHIRE
          </h1>
          <p className="text-slate-400 font-medium text-sm tracking-tight text-center px-4">
            {isRegister 
              ? 'Crie sua conta administrativa para começar.' 
              : 'Sistema de Gestão Profissional Modular.'}
          </p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleLogin}
          className="bg-white p-8 lg:p-10 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-6"
        >
          <div className="space-y-4">
            {isRegister && (
               <div className="group relative animate-slide-up">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Nome Completo" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
                  />
               </div>
            )}

            <div className="group relative">
               <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
               <input 
                 type="email" 
                 required
                 placeholder="E-mail" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
               />
            </div>

            <div className="group relative">
               <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
               <input 
                 type="password" 
                 required
                 placeholder="Senha" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all"
               />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>{isRegister ? 'Criar Minha Conta' : 'Entrar no Painel'} <ArrowRight size={18} /></>
            )}
          </button>

          <div className="pt-2 text-center">
            <button 
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isRegister ? 'Já tenho uma conta' : 'Não tenho conta? Criar agora'}
            </button>
          </div>
        </form>

        <div className="mt-10 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
             Sapphire Intelligent Retail v3.2 &copy; 2026
           </p>
        </div>
      </div>
    </div>
  )
}
