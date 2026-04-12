'use client'

import React from 'react'
import { 
  CheckCircle2, 
  MessageSquare, 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  QrCode,
  ShoppingCart
} from 'lucide-react'

/**
 * CheckoutView - Gravity High-Precision Finalizer
 * Elegant glassmorphism summary with direct WhatsApp integration.
 * Mobile-first optimization with large touch targets.
 */
export function CheckoutView({ onBack }: { onBack: () => void }) {
  // Demo Cart Data
  const items = [
    { name: 'CAMISETA AGRO TECH', price: 89.90, qty: 2 },
    { name: 'BONÉ GRAVITY BLUE', price: 54.00, qty: 1 }
  ];

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto pb-40">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2.5 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar Terminal
        </button>
        
        <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
           <ShoppingCart size={14} /> Checkout Seguro
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div className="space-y-10">
          {/* Order Summary Section */}
          <section>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-8 italic">RESUMO DA COMPRA</h2>
            <div className="glass-panel rounded-[2rem] p-8 space-y-6 border-white/5 shadow-inner">
               {items.map((item, i) => (
                 <div key={i} className="flex items-center justify-between py-2 group">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{item.name}</span>
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {item.qty} un × R$ {item.price.toFixed(2)}
                       </span>
                    </div>
                    <span className="text-md font-black text-white tracking-tight">
                       R$ {(item.price * item.qty).toFixed(2)}
                    </span>
                 </div>
               ))}
               
               <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</span>
                  <span className="text-xl font-black text-white">R$ {subtotal.toFixed(2)}</span>
               </div>
            </div>
          </section>

          {/* Payment Strategy Section */}
          <section>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">FORMA DE RECEBIMENTO</h3>
            <div className="grid grid-cols-2 gap-4">
               <PaymentMethod icon={<QrCode size={22} />} label="PIX Instantâneo" />
               <PaymentMethod icon={<Banknote size={22} />} label="Dinh. Espécie" />
               <PaymentMethod icon={<CreditCard size={22} />} label="Cartão Déb/Créd" active />
               <PaymentMethod icon={<MessageSquare size={22} />} label="Conta Cliente" />
            </div>
          </section>
        </div>

        {/* Final Action Hub */}
        <aside className="lg:sticky lg:top-32">
          <div className="glass-card p-10 rounded-[2.5rem] border-blue-500/20 shadow-[0_40px_80px_-15px_rgba(2,6,23,0.8)] relative group">
            <div className="absolute inset-0 bg-blue-600/5 rounded-[2.5rem] pointer-events-none group-hover:bg-blue-600/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex flex-col gap-2 mb-10">
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">TOTAL LÍQUIDO</span>
                 <span className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                    <span className="text-2xl text-slate-500 mr-2 opacity-50">R$</span>
                    {subtotal.toFixed(2)}
                 </span>
              </div>

              <div className="space-y-4">
                 <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-sm flex items-center justify-center gap-4 neon-glow hover:bg-blue-500 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0">
                    CONFIRMAR PAGAMENTO <CheckCircle2 size={24} />
                 </button>
                 
                 <button 
                   onClick={() => window.open(`https://wa.me/?text=PDV%20Conception%20-%20Resumo:%20R$%20${subtotal.toFixed(2)}`, '_blank')}
                   className="w-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 py-6 rounded-2xl font-black text-sm flex items-center justify-center gap-4 hover:bg-emerald-600/20 transition-all hover:border-emerald-500/40"
                 >
                    ENVIAR AO WHATSAPP <MessageSquare size={24} />
                 </button>
              </div>
              
              <p className="mt-8 text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                 Transação segura via Gravity Engine v1.0<br/>Liberdade-MG Operacional
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

interface PaymentMethodProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function PaymentMethod({ icon, label, active = false }: PaymentMethodProps) {
  return (
    <button className={`flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border transition-all duration-300 ${
      active 
        ? 'bg-blue-600 text-white border-blue-400 shadow-[0_15px_30px_rgba(59,130,246,0.3)] scale-105 z-10' 
        : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-white hover:bg-white/[0.08]'
    }`}>
       <div className={`${active ? 'text-white' : 'text-blue-500 opacity-60'}`}>{icon}</div>
       <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">{label}</span>
    </button>
  )
}
