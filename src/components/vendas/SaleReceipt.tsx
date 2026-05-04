'use client'

import React from 'react'
import { 
  Printer, 
  MessageCircle, 
  ArrowLeft, 
  CheckCircle,
  Copy,
  Share2
} from 'lucide-react'

interface SaleReceiptProps {
  saleId: string
  items: any[]
  total: number
  paymentInfo: any
  customer: any | null
  onClose: () => void
}

/**
 * Sapphire v2.0 - SaleReceipt
 * Professional digital receipt optimized for screen, print, and WhatsApp.
 */
export function SaleReceipt({ saleId, items, total, paymentInfo, customer, onClose }: SaleReceiptProps) {
  
  const generateWhatsAppMessage = () => {
    const greeting = customer ? `Olá ${customer.name},` : 'Olá,'
    const itemsList = items.map(i => `${i.qty}x ${i.name}`).join(', ')
    const methodStr = paymentInfo.method === 'FIADO' ? 'Fiado/Caderneta' : paymentInfo.method
    
    const message = `${greeting} aqui está o resumo da sua compra na Sapphire: ${itemsList}. Total: R$ ${(total || 0).toFixed(2)}. Pago via: ${methodStr}. Obrigado!`
    
    return encodeURIComponent(message)
  }

  const handleWhatsAppShare = () => {
    const phone = customer?.phone ? `55${customer.phone.replace(/\D/g, '')}` : ''
    const url = `https://wa.me/${phone}?text=${generateWhatsAppMessage()}`
    window.open(url, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md animate-fade-in no-print cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8 no-print pointer-events-none">
        <div 
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col pointer-events-auto max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
        
        {/* Receipt Header */}
        <div className="bg-emerald-600 p-8 text-center text-white relative">
           <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <CheckCircle size={32} />
           </div>
           <h3 className="text-xl font-black uppercase tracking-widest">Venda Finalizada</h3>
           <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-2">ID: #{saleId.slice(-8).toUpperCase()}</p>
        </div>

        {/* Receipt Body (The Coupon) */}
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
           {/* Items Section */}
           <div className="space-y-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Resumo do Pedido</span>
              <div className="space-y-3">
                 {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                       <span className="font-medium text-slate-600">{item.qty}x {item.name}</span>
                       <span className="font-black text-slate-900">R$ {((item.price || 0) * (item.qty || 0)).toFixed(2)}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Financial Section */}
           <div className="pt-6 border-t border-dashed border-slate-200 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <span>Subtotal</span>
                 <span>R$ {(total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900">
                 <span>TOTAL PAGO</span>
                 <span className="text-blue-600">R$ {(total || 0).toFixed(2)}</span>
              </div>
              <div className="pt-2">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Meio de Pagamento</span>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span className="bg-slate-100 px-2 py-1 rounded capitalize">{paymentInfo.method.toLowerCase()}</span>
                    {paymentInfo.method === 'DINHEIRO' && paymentInfo.change > 0 && (
                      <span className="text-emerald-600 ml-auto">Troco: R$ {(paymentInfo?.change || 0).toFixed(2)}</span>
                    )}
                 </div>
              </div>
           </div>

           {/* Customer & Notes */}
           {(customer || paymentInfo.notes) && (
              <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                 {customer && (
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400">
                          <Share2 size={16} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Cliente</span>
                          <span className="text-xs font-bold text-slate-900">{customer.name}</span>
                       </div>
                    </div>
                 )}
                 {paymentInfo.notes && (
                    <p className="text-[10px] font-medium text-slate-500 italic">
                       "{paymentInfo.notes}"
                    </p>
                 )}
              </div>
           )}
        </div>

        {/* Action Console */}
        <div className="p-8 pt-0 grid grid-cols-2 gap-4">
           <button 
             onClick={handleWhatsAppShare}
             className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all"
           >
              <MessageCircle size={18} /> WhatsApp
           </button>
           <button 
             onClick={handlePrint}
             className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
           >
              <Printer size={18} /> Imprimir
           </button>
           <button 
             onClick={onClose}
             className="col-span-2 py-4 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-2"
           >
              <ArrowLeft size={16} /> Nova Venda
           </button>
        </div>
      </div>
    </div>
    </>
  )
}
