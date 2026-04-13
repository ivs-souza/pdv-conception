'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { TerminalGrid } from '@/components/vendas/TerminalGrid'
import { ActiveCart } from '@/components/vendas/ActiveCart'
import { SaleReceipt } from '@/components/vendas/SaleReceipt'
import { SaleService } from '@/services/sale.service'
import { CustomerService } from '@/services/customer.service'
import { useToast } from '@/components/layout/Toast'
import { db } from '@/utils/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { Save, Search, LayoutGrid } from 'lucide-react'
import { CategoryService } from '@/services/category.service'

/**
 * Vendas Terminal v3.1 (Sapphire Fast-Track)
 * Layout: 2 Columns (65% Product Discovery | 35% Payment Execution)
 * Focus: Categorized discovery and rapid checkout.
 */
export default function VendasPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [cartItems, setCartItems] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [isBounce, setIsBounce] = useState(false)
  const [lastSaleResult, setLastSaleResult] = useState<any | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { showToast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 1. Initial Listeners
  useEffect(() => {
    if (!db) return
    
    // Products Listener
    const qProducts = query(collection(db, "produtos"), orderBy("name", "asc"))
    const unsubProducts = onSnapshot(qProducts, (snapshot: any) => {
      setProducts(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })

    // Categories Fetch
    const fetchCats = async () => {
      const cats = await CategoryService.getCategories()
      setCategories(cats)
    }
    fetchCats()

    // 1.1 Hydrate Cart from LocalStorage
    try {
      const savedCart = localStorage.getItem('sapphire_cart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (e) {
      console.error("Cart Hydration Error:", e)
    }

    return () => unsubProducts()
  }, [])

  // 1.2 Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('sapphire_cart', JSON.stringify(cartItems))
  }, [cartItems])

  // 2. Instant Filtering Logic (Search + Category)
  const filteredProducts = useMemo(() => {
    let result = products

    // Apply Category Filter
    if (selectedCategory !== 'Todas') {
      result = result.filter(p => p.category === selectedCategory)
    }

    // Apply Search Filter
    if (searchTerm) {
      const queryStr = searchTerm.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(queryStr) || 
        p.sku?.toLowerCase().includes(queryStr) ||
        p.category?.toLowerCase().includes(queryStr)
      )
    }

    return result
  }, [searchTerm, products, selectedCategory])

  // 3. Cart Logic
  const handleAddToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: (product.qty || 1) }]
    })

    setIsBounce(true)
    setTimeout(() => setIsBounce(false), 300)
    
    // Auto-clean search and focus (v3.0 Rapid selection)
    setSearchTerm('')
    searchInputRef.current?.focus()
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

  // 4. Instant Finalization Hub (One-Click Payment)
  const handleFinalize = async (paymentInfo: any) => {
    if (cartItems.length === 0) return

    // BI: Stock Availability Validation (v3.5)
    for (const item of cartItems) {
      const dbProduct = products.find(p => p.id === item.id)
      if (dbProduct && Number(dbProduct.currentStock || 0) < Number(item.qty)) {
        showToast(`Estoque insuficiente para a venda de ${item.name}. (Disponível: ${dbProduct.currentStock})`, "error")
        return
      }
    }

    setIsProcessing(true)
    
    try {
      const subtotal = cartItems.reduce((acc, item) => {
        const itemPrice = item.precoVenda ?? item.preco_venda ?? item.salePrice ?? item.price ?? 0
        return acc + (Number(itemPrice) * (item.qty || 0))
      }, 0)
      const finalTotal = subtotal
      
      const saleResult = await SaleService.registerSale(
        cartItems, 
        finalTotal, 
        selectedCustomer?.id || null, 
        selectedCustomer?.name || null,
        paymentInfo
      )

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

      // Reset for next sale
      setCartItems([])
      setSelectedCustomer(null)
      setSearchTerm('')
      setSelectedCategory('Todas')
      showToast(`Venda ${paymentInfo.method} realizada!`, "success")
      
      // Return focus to search for the next product
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } catch (e: any) {
      console.error("🔴 Erro na Finalização da Venda:", e)
      showToast(`Falha ao registrar venda. Verifique o console para detalhes (Erro: ${e.code || 'Desconhecido'}).`, "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)] overflow-hidden animate-fade-in">
      {/* 🟢 Column Left: Search + Discovery (65%) */}
      <div className="flex flex-col flex-[0.65] h-full space-y-6">
        {/* Hub Header: Search + Category Pills */}
        <div className="space-y-4">
          {/* Huge Search Bar */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Pesquisar Produto (Nome, SKU ou Categoria)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white border-2 border-slate-100 rounded-3xl text-xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-50/50 transition-all shadow-sm"
              autoFocus
            />
          </div>

          {/* Category Pills v3.1 */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar pr-4">
             <button 
               onClick={() => setSelectedCategory('Todas')}
               className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                 selectedCategory === 'Todas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400 hover:border-blue-200'
               }`}
             >
                <LayoutGrid size={14} /> Todas
             </button>
             {categories.map(cat => (
               <button 
                 key={cat.id}
                 onClick={() => setSelectedCategory(cat.name)}
                 className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                   selectedCategory === cat.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400 hover:border-blue-200'
                 }`}
               >
                  {cat.name}
               </button>
             ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          <TerminalGrid 
            products={filteredProducts} 
            loading={loading} 
            onAdd={handleAddToCart} 
          />
        </div>
      </div>

      {/* 🔵 Column Right: Cart + Payments (35%) */}
      <div className="flex-[0.35] h-full">
         <ActiveCart 
           items={cartItems}
           selectedCustomer={selectedCustomer}
           onSelectCustomer={setSelectedCustomer}
           isBounce={isBounce}
           onUpdateQty={handleUpdateQty}
           onRemove={handleRemove}
           onFinalize={handleFinalize}
           isProcessing={isProcessing}
         />
      </div>

      {/* Receipt Zone */}
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
