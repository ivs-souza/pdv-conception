import { useState, useMemo } from 'react'

export interface CartItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  originalPrice: number
  requiresAudit: boolean
}

/**
 * useCart Hook
 * Manages the checkout state locally.
 * Includes logic to detect high discounts (> 10%) for audit feedback.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const total = useMemo(() => 
    items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  , [items])

  /**
   * Adds an item to the cart or increments quantity if it exists.
   */
  const addItem = (product: { id: string, name: string, sku: string, sale_price: number }) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id 
          ? { ...i, quantity: i.quantity + 1 } 
          : i
        )
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.sale_price,
        originalPrice: product.sale_price,
        requiresAudit: false
      }]
    })
  }

  /**
   * Updates the price of an item and recalculates audit requirements.
   */
  const updatePrice = (id: string, newPrice: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const discount = (item.originalPrice - newPrice) / item.originalPrice
        return { 
          ...item, 
          price: newPrice, 
          requiresAudit: discount > 0.10 
        }
      }
      return item
    }))
  }

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
        : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearCart = () => setItems([])

  return {
    items,
    total,
    addItem,
    updatePrice,
    updateQuantity,
    removeItem,
    clearCart
  }
}
