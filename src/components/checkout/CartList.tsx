'use client'

import React from 'react'

interface CartItem {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  originalPrice: number
  requiresAudit: boolean
}

interface CartListProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onUpdatePrice: (id: string, newPrice: number) => void
  onRemove: (id: string) => void
}

/**
 * CartList Component
 * Displays the current items in the checkout.
 * Features ultra-clean typography and 'audit shield' visual feedback.
 */
export function CartList({ items, onUpdateQuantity, onUpdatePrice, onRemove }: CartListProps) {
  return (
    <div className="cart-list magazine-card">
      <div className="cart-header">
        <span className="col-product">PRODUTO</span>
        <span className="col-qty">QTD</span>
        <span className="col-unit">VALOR UNIT.</span>
        <span className="col-subtotal">SUBTOTAL</span>
      </div>

      <div className="cart-body">
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>AGUARDANDO LANÇAMENTO DE ITENS...</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="cart-row">
              <div className="col-product">
                <div className="product-meta">
                  <span className="product-name font-bold">{item.name}</span>
                  <span className="product-sku font-medium">{item.sku}</span>
                </div>
              </div>

              <div className="col-qty">
                <div className="qty-control">
                  <button onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                  <span className="qty-val font-bold">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                </div>
              </div>

              <div className="col-unit">
                <div className="price-input-wrapper">
                  {item.requiresAudit && (
                    <span 
                      className="audit-shield" 
                      title="Desconto > 10%: Esta ação será registrada na auditoria."
                    >
                      🛡️
                    </span>
                  )}
                  <input
                    type="number"
                    className="price-input font-medium"
                    value={item.price}
                    onChange={(e) => onUpdatePrice(item.id, parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="col-subtotal">
                <span className="subtotal-val font-black">
                  {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <button className="remove-btn" onClick={() => onRemove(item.id)}>×</button>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .cart-list {
          overflow: hidden;
        }
        .cart-header {
          display: grid;
          grid-template-columns: 2fr 100px 150px 1fr;
          padding: 1rem 2rem;
          background: var(--slate-100);
          border-bottom: 2px solid var(--slate-900);
          font-size: 0.75rem;
          font-weight: 900;
          color: var(--slate-900);
        }
        .cart-body {
          min-height: 400px;
        }
        .empty-cart {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: var(--gray-200);
          font-weight: 700;
        }
        .cart-row {
          display: grid;
          grid-template-columns: 2fr 100px 150px 1fr;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--gray-200);
          align-items: center;
        }
        .product-meta {
          display: flex;
          flex-direction: column;
        }
        .product-name {
          font-size: 1.1rem;
          color: var(--slate-900);
        }
        .product-sku {
          font-size: 0.7rem;
          color: var(--slate-800);
          opacity: 0.6;
        }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .qty-control button {
          border: 1px solid var(--gray-200);
          background: white;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-weight: 700;
        }
        .price-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .price-input {
          border: none;
          background: var(--gray-50);
          padding: 0.5rem;
          width: 80px;
          font-size: 1rem;
          outline: none;
          text-align: right;
        }
        .audit-shield {
          cursor: help;
          font-size: 1.2rem;
        }
        .subtotal-val {
          font-size: 1.25rem;
          color: var(--slate-900);
        }
        .remove-btn {
          margin-left: 1rem;
          border: none;
          background: none;
          color: var(--red-600);
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.3;
        }
        .remove-btn:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
