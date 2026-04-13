'use client'

import React, { useState } from 'react'
import { TerminalGrid } from '@/components/vendas/TerminalGrid'
import { CartDrawer } from '@/components/vendas/CartDrawer'
import { CheckoutModal } from '@/components/vendas/CheckoutModal'
import { SaleReceipt } from '@/components/vendas/SaleReceipt'
import { SaleService } from '@/services/sale.service'
import { CustomerService } from '@/services/customer.service'
import { useToast } from '@/components/layout/Toast'

/**
 * Vendas Terminal (v2.0)
 * Layout: Split-screen (Grid + Cart Drawer)
 * Aesthetic: Clean & Clear Premium
 */
export default function VendasPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [isBounce, setIsBounce] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [lastSaleResult, setLastSaleResult] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()

  // Logic to add item and trigger the bounce effect
  const handleAddToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })

    // Trigger Bounce Animation
    setIsBounce(true)
    setTimeout(() => setIsBounce(false), 300)
  }

  const handleUpdateQty = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta)
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const handleRemove = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const handleFinalize = async (paymentInfo: any) => {
    if (cartItems.length === 0) return
    setIsProcessing(true)
    try {
      const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
      const finalTotal = total * 1.05
      
      const saleResult = await SaleService.registerSale(
        cartItems, 
        finalTotal, 
        selectedCustomer?.id || null, 
        selectedCustomer?.name || null,
        paymentInfo
      )

      // Handle "Fiado" logic: Update client debt balance
      if (paymentInfo.method === 'FIADO' && selectedCustomer?.id) {
        await CustomerService.incrementDebt(selectedCustomer.id, finalTotal)
      }

      setLastSaleResult({
        id: saleResult.id,
        items: [...cartItems],
        total: finalTotal,
        paymentInfo,
        customer: selectedCustomer ? { ...selectedCustomer } : null
      })

      setCartItems([])
      setSelectedCustomer(null)
      setShowCheckout(false)
      showToast("Venda processada com sucesso!", "success")
    } catch (e) {
      showToast("Erro ao processar venda.", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in relative">
      {/* Main Terminal Grid */}
      <div className="flex-1 lg:max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
        <TerminalGrid onAdd={handleAddToCart} />
      </div>

      {/* Persistent Lateral Cart Drawer */}
      <aside className="w-full lg:w-[380px] shrink-0">
        <CartDrawer 
          items={cartItems} 
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          isBounce={isBounce}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemove}
          onCheckout={() => setShowCheckout(true)}
        />
      </aside>

      {/* Checkout Modal Integration */}
      {showCheckout && (
        <CheckoutModal 
          total={subtotal * 1.05} 
          customer={selectedCustomer}
          onConfirm={handleFinalize} 
          onClose={() => setShowCheckout(false)} 
        />
      )}

      {/* Post-Sale Receipt Display */}
      {lastSaleResult && (
        <SaleReceipt 
          saleId={lastSaleResult.id}
          items={lastSaleResult.items}
          total={lastSaleResult.total}
          paymentInfo={lastSaleResult.paymentInfo}
          customer={lastSaleResult.customer}
          onClose={() => setLastSaleResult(null)}
        />
      )}
    </div>
  )
}
