'use client'

import React, { useState } from 'react'
import { Wallet, Lock, LockOpen, TrendingUp, TrendingDown, DollarSign, ArrowRight, History } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrentRegister } from '@/hooks/useCurrentRegister'
import { OpenRegisterModal } from '@/components/dashboard/OpenRegisterModal'
import { CloseRegisterModal } from '@/components/dashboard/CloseRegisterModal'
import { formatCurrency } from '@/utils/format'
import { OperatorSalesList } from '@/components/caixa/OperatorSalesList'

/**
 * Sapphire v4.0 - Meu Turno (Shift Management)
 * Unified interface for sellers and admins to manage their personal cash shift.
 */
export default function CaixaPage() {
  const { userData } = useAuth()
  const { currentRegister, isLoading, isOpen } = useCurrentRegister()
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando informações do turno...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Wallet className="text-blue-600" size={32} />
          Meu Turno
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Controle de Abertura e Fechamento de Caixa</p>
      </header>

      {/* Shift Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-2 premium-card p-8 flex flex-col justify-between min-h-[280px] relative overflow-hidden transition-all ${isOpen ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-slate-900 text-white shadow-xl shadow-slate-200'}`}>
          {/* Background Decoration */}
          <div className="absolute -right-10 -bottom-10 opacity-10">
             {isOpen ? <LockOpen size={200} /> : <Lock size={200} />}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isOpen ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                {isOpen ? 'Turno Ativo' : 'Turno Encerrado'}
              </div>
              {isOpen && (
                <span className="text-[10px] font-bold text-emerald-100 opacity-80">
                  Desde {currentRegister.openedAt?.toDate().toLocaleString('pt-BR')}
                </span>
              )}
            </div>

            <h2 className="text-4xl font-black tracking-tighter mb-2">
              {isOpen ? 'Caixa em Operação' : 'Pronto para Iniciar?'}
            </h2>
            <p className="text-sm font-medium opacity-70 max-w-sm">
              {isOpen 
                ? `Operador: ${currentRegister.operatorName}. Lembre-se de conferir o fundo de caixa ao final do dia.` 
                : 'Abra seu turno para começar a registrar vendas e recebimentos no sistema.'}
            </p>
          </div>

          <div className="relative z-10 flex gap-4 mt-8">
            {isOpen ? (
              <button 
                onClick={() => setShowCloseModal(true)}
                className="px-8 py-4 bg-white text-emerald-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <Lock size={18} /> Fechar Meu Caixa
              </button>
            ) : (
              <button 
                onClick={() => setShowOpenModal(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <LockOpen size={18} /> Abrir Novo Turno
              </button>
            )}
            
            <a 
              href="/vendas"
              className={`px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isOpen ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}`}
              onClick={(e) => !isOpen && e.preventDefault()}
            >
              Ir para Vendas <ArrowRight size={18} />
            </a>
          </div>
        </div>

        {/* Small Stats for Seller */}
        <div className="space-y-6">
           <div className="premium-card p-6 border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fundo Inicial</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {isOpen ? formatCurrency(currentRegister.initialCash) : '---'}
              </h3>
           </div>

           {userData?.role === 'admin' ? (
              <div className="premium-card p-6 border-slate-100 bg-blue-50/30">
                 <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <TrendingUp size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Painel Admin</span>
                 </div>
                 <p className="text-xs font-medium text-slate-500 mb-4">Você tem acesso aos relatórios consolidados.</p>
                 <a href="/" className="text-[10px] font-black text-blue-600 uppercase underline">Ver Dashboard</a>
              </div>
           ) : (
              <div className="premium-card p-6 border-slate-100">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Meu Status</span>
                 <p className="text-xs font-bold text-slate-600 uppercase">
                    Vendedor Sapphire
                 </p>
              </div>
           )}
        </div>
      </div>

      {/* Operator Sales History */}
      <div className="space-y-4">
         <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Auditoria de Vendas</h2>
            <div className="h-[1px] flex-1 bg-slate-100" />
         </div>
         <OperatorSalesList 
            unidade={userData!.unidade} 
            operatorId={userData!.uid} 
            operatorName={userData!.nome}
            openedAt={currentRegister?.openedAt}
            isOpen={isOpen}
         />
      </div>

      {/* Instructions / Security Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex gap-6 items-start">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
            <History size={24} />
         </div>
         <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Boas Práticas de Turno</h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc ml-4 font-medium">
               <li>Nunca compartilhe sua senha de acesso com outros colaboradores.</li>
               <li>Certifique-se de que o valor contado na gaveta bate com o esperado antes de fechar.</li>
               <li>Divergências acima de 1% devem ser reportadas imediatamente ao administrador.</li>
               <li>O fechamento do turno gera um relatório automático enviado via WhatsApp para a gerência.</li>
            </ul>
         </div>
      </div>

      {/* Modals */}
      {showOpenModal && <OpenRegisterModal onClose={() => setShowOpenModal(false)} />}
      {showCloseModal && currentRegister && (
        <CloseRegisterModal 
          register={currentRegister} 
          onClose={() => setShowCloseModal(false)} 
        />
      )}
    </div>
  )
}
