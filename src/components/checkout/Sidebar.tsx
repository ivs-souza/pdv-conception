'use client'

import React from 'react'

interface CheckoutSidebarProps {
  total: number
  client?: {
    name: string
    creditLimit: number
    currentBalance: number
  }
}

/**
 * CheckoutSidebar Component
 * The high-contrast operation center.
 * Features the 'Huge Totalizer' and the 'Fiado' awareness widget.
 * Now integrated with Financial Intelligence for fee calculation.
 */
export function CheckoutSidebar({ total, client }: CheckoutSidebarProps) {
  // Simulation of overdue finance intelligence data
  // In production: const overdueData = await FinanceService.calculateOverdueFees(client.currentBalance, client.lastDueDate)
  const overdueData = client && client.currentBalance > 0 ? {
    principal: client.currentBalance,
    lateFee: client.currentBalance * 0.02,
    interest: client.currentBalance * 0.015,
    totalDue: client.currentBalance * 1.035,
    daysOverdue: 15
  } : null;

  return (
    <div className="checkout-sidebar">
      {/* Client Identity Widget */}
      <div className="client-widget magazine-card">
        <div className="widget-header">
          <span className="font-black">CLIENTE</span>
          <span className="status-badge">CONSULTA FINANCEIRA ATIVA</span>
        </div>
        <div className="widget-content">
          <input 
            type="text" 
            placeholder="NOME OU CPF/CNPJ..." 
            className="client-search font-medium"
          />
          
          {client ? (
            <div className="client-data">
              <div className="data-row">
                <span className="label">DÍVIDA ORIGINAL</span>
                <span className="value font-bold">{overdueData?.principal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              {overdueData && overdueData.daysOverdue > 0 && (
                <>
                  <div className="data-row fee-item">
                    <span className="label">MULTA POR ATRASO (2%)</span>
                    <span className="value font-black highlight-red">+ {overdueData.lateFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="data-row fee-item">
                    <span className="label">JUROS DE MORA ({overdueData.daysOverdue} DIAS)</span>
                    <span className="value font-black highlight-red">+ {overdueData.interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="data-row total-overdue font-black">
                    <span className="label">QUITAÇÃO ATUALIZADA</span>
                    <span className="value">{overdueData.totalDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="client-placeholder font-medium">
              CONSUMIDOR PADRÃO
            </div>
          )}
        </div>
      </div>

      {/* Massive Totalizer */}
      <div className="total-display">
        <div className="total-header">
          <span className="font-black">TOTAL A PAGAR</span>
        </div>
        <div className="total-value text-total font-black">
          {(total + (overdueData?.totalDue || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '')}
          <span className="currency-symbol">R$</span>
        </div>
      </div>

      {/* Payment Grid */}
      <div className="payment-actions">
        <div className="quick-pay">
          <button className="btn-action font-black">DINHEIRO</button>
          <button className="btn-action font-black">PIX</button>
          <button className="btn-action font-black">CARTÃO</button>
        </div>
        <button className="btn-primary-payment font-black">
          CONTA CLIENTE (FIADO)
        </button>
        <button className="btn-settle-debt font-black" onClick={() => alert('DÍVIDA BAIXADA COM LOG DE AUDITORIA')}>
          BAIXAR DÍVIDA ATUALIZADA
        </button>
        <button className="btn-cancel font-bold">CANCELAR VENDA [F12]</button>
      </div>

      <style jsx>{`
        .checkout-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .widget-header {
          background: var(--slate-900);
          color: white;
          padding: 0.75rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }
        .status-badge {
          font-size: 0.65rem;
          opacity: 0.6;
        }
        .widget-content {
          padding: 1.25rem;
        }
        .client-search {
          width: 100%;
          border: none;
          background: var(--gray-50);
          padding: 1rem;
          font-size: 1rem;
          outline: none;
          border-bottom: 2px solid var(--gray-200);
          transition: border-color 0.2s;
        }
        .client-search:focus {
          border-color: var(--slate-900);
        }
        .client-placeholder {
          margin-top: 1rem;
          text-align: center;
          color: var(--gray-200);
          font-size: 0.7rem;
        }
        .client-data {
          margin-top: 1.25rem;
        }
        .data-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }
        .fee-item {
          color: var(--red-600);
          font-size: 0.75rem;
        }
        .total-overdue {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 2px solid var(--slate-900);
          font-size: 0.9rem;
        }
        .highlight-red { color: var(--red-600); }
        .total-display {
          text-align: right;
          margin: 1.5rem 0;
        }
        .total-header {
          font-size: 0.9rem;
          color: var(--slate-900);
          opacity: 0.5;
        }
        .total-value {
          position: relative;
          color: var(--slate-900);
        }
        .currency-symbol {
          font-size: 1.5rem;
          margin-left: 0.5rem;
          vertical-align: top;
        }
        .payment-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .quick-pay {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.5rem;
        }
        .btn-action {
          height: 60px;
          border: 2px solid var(--slate-900);
          background: white;
          color: var(--slate-900);
          font-size: 0.75rem;
          cursor: pointer;
        }
        .btn-action:hover {
          background: var(--slate-900);
          color: white;
        }
        .btn-primary-payment {
          height: 70px;
          background: var(--emerald-600);
          color: white;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .btn-settle-debt {
          height: 50px;
          background: var(--slate-900);
          color: white;
          border: none;
          font-size: 0.85rem;
          cursor: pointer;
          border-left: 10px solid var(--red-600);
        }
        .btn-cancel {
          background: transparent;
          color: var(--red-600);
          border: none;
          padding: 0.5rem;
          font-size: 0.75rem;
          cursor: pointer;
          opacity: 0.6;
        }
      `}</style>
    </div>
  )
}
