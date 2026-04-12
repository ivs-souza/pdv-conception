'use client'

import React from 'react'

interface ReceiptProps {
  sale: {
    id: string
    items: any[]
    total: number
    paymentMethod: string
    customerName?: string
    customerBalance?: number
    createdAt: string
  }
}

/**
 * ReceiptTemplate Component
 * Implements an 80mm thermal receipt design intended for physical printing.
 * Uses Mono typography and `@media print` rules for correct formatting.
 */
export function ReceiptTemplate({ sale }: ReceiptProps) {
  return (
    <div id="thermal-print" className="receipt-container">
      <div className="receipt-header">
        <h1 className="font-bold">PDV CONCEPTION</h1>
        <p className="subtitle">MÓDULO DE SAÍDA INTELIGENTE</p>
        <p>Venda: {sale.id.slice(0, 8).toUpperCase()}</p>
        <p>{new Date(sale.createdAt).toLocaleString('pt-BR')}</p>
        <div className="divider">================================</div>
      </div>

      <div className="receipt-body">
        <div className="body-header">
          <span>DESCRIÇÃO</span>
          <span>VALOR</span>
        </div>
        <div className="divider">--------------------------------</div>
        {sale.items.map((item, index) => (
          <div key={index} className="item-row">
            <div className="item-name">{item.name.toUpperCase()}</div>
            <div className="item-calc">
              <span>{item.quantity} UN X {item.price.toFixed(2)}</span>
              <span className="item-total">{(item.quantity * item.price).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="divider">================================</div>
      
      <div className="receipt-total font-bold">
        <span>TOTAL GERAL:</span>
        <span>R$ {sale.total.toFixed(2)}</span>
      </div>

      <div className="receipt-footer">
        <div className="payment-method">
          <span>MEIO DE PAGAMENTO: {sale.paymentMethod.replace('_', ' ')}</span>
        </div>

        {/* Fiado (Conta Cliente) Signature Trigger */}
        {sale.paymentMethod === 'CONTA_CLIENTE' && (
          <div className="signature-zone">
            <div className="spacer" />
            <div className="spacer" />
            <div className="sig-line">________________________________</div>
            <p className="sig-label">ASSINATURA: {sale.customerName?.toUpperCase() || 'CLIENTE'}</p>
            {sale.customerBalance !== undefined && (
              <p className="sig-balance">DÉBITO ATUALIZADO: R$ {sale.customerBalance.toFixed(2)}</p>
            )}
            <p className="sig-warning">Reconheço e pagarei a dívida acima.</p>
          </div>
        )}

        <div className="footer-msg">
          <br />
          <p>Obrigado por confiar no PDV Conception.</p>
          <p>LidAgro Ecosystem - 2026</p>
        </div>
      </div>

      <style jsx>{`
        .receipt-container {
          width: 80mm;
          min-height: 100mm;
          background: white;
          color: black;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          padding: 10px;
          margin: 0 auto;
          display: none; /* Hidden on screen by default */
        }

        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body * {
            visibility: hidden;
          }
          #thermal-print, #thermal-print * {
            visibility: visible;
          }
          #thermal-print {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 5mm;
          }
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 10px;
        }
        .receipt-header h1 {
          font-size: 16px;
          margin: 0;
        }
        .subtitle {
          font-size: 9px;
          margin-bottom: 5px;
        }
        .divider {
          margin: 5px 0;
          letter-spacing: -1px;
          overflow: hidden;
          white-space: nowrap;
        }
        .body-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 11px;
        }
        .item-row {
          margin-bottom: 8px;
        }
        .item-calc {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          padding-left: 10px;
        }
        .receipt-total {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin: 10px 0;
        }
        .signature-zone {
          text-align: center;
          margin-top: 25px;
        }
        .sig-line {
          margin-bottom: 5px;
        }
        .sig-label {
          font-size: 10px;
          font-weight: bold;
        }
        .sig-warning {
          font-size: 8px;
          margin-top: 4px;
          font-style: italic;
        }
        .spacer {
          height: 15px;
        }
        .footer-msg {
          text-align: center;
          font-size: 9px;
          opacity: 0.7;
          margin-top: 15px;
        }
      `}</style>
    </div>
  )
}
