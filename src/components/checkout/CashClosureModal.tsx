'use client'

import React, { useState } from 'react'

interface ClosureSummary {
  cashExpected: number
  pixTotal: number
  cardTotal: number
  fiadoTotal: number
  initialAmount: number
}

interface CashClosureModalProps {
  summary: ClosureSummary
  onConfirm: (informedAmount: number) => void
  onCancel: () => void
}

/**
 * CashClosureModal Component
 * Final stage of the shift lifecycle.
 * Provides a clean financial summary and handles physical cash verification.
 * Follows the high-contrast 'Magazine' aesthetic.
 */
export function CashClosureModal({ summary, onConfirm, onCancel }: CashClosureModalProps) {
  const [informedCash, setInformedCash] = useState<string>('')
  
  const expectedCash = summary.cashExpected + summary.initialAmount
  const totalDifference = informedCash !== '' ? parseFloat(informedCash) - expectedCash : 0
  const hasInformed = informedCash !== '' && !isNaN(parseFloat(informedCash))

  return (
    <div className="closure-overlay">
      <div className="closure-modal magazine-card">
        <header className="closure-header">
          <h2 className="font-black">FECHAMENTO DE TURNO</h2>
          <span className="status-label">AUDITORIA EM TEMPO REAL</span>
        </header>

        <div className="closure-body">
          {/* Financial Summary Grid */}
          <div className="summary-grid">
            <div className="summary-section">
              <span className="section-label font-bold">ENTRADAS DIGITAIS</span>
              <div className="metric">
                <span className="m-label">PIX TOTAL:</span>
                <span className="m-val font-bold">R$ {summary.pixTotal.toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="m-label">CARTÃO TOTAL:</span>
                <span className="m-val font-bold">R$ {summary.cardTotal.toFixed(2)}</span>
              </div>
              <div className="metric highlight-fiado">
                <span className="m-label">FIADO (CADERNINHO):</span>
                <span className="m-val font-black">R$ {summary.fiadoTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-section cash-focus">
              <span className="section-label font-bold">CONFERÊNCIA DE ESPÉCIE</span>
              <div className="metric">
                <span className="m-label">SALDO INICIAL:</span>
                <span className="m-val">R$ {summary.initialAmount.toFixed(2)}</span>
              </div>
              <div className="metric">
                <span className="m-label">VENDAS EM DINHEIRO:</span>
                <span className="m-val">R$ {summary.cashExpected.toFixed(2)}</span>
              </div>
              <div className="expected-total">
                <span className="font-black">EXPECTATIVA DE CAIXA:</span>
                <span className="font-black">R$ {expectedCash.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* User Entry Zone */}
          <div className="entry-zone">
            <label className="font-bold">TOTAL EM ESPÉCIE CONTADO (FÍSICO):</label>
            <div className="input-wrapper">
              <span className="currency">R$</span>
              <input 
                type="number" 
                step="0.01"
                placeholder="0,00"
                className="physical-input font-black"
                value={informedCash}
                onChange={(e) => setInformedCash(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Audit Feedback */}
          {hasInformed && (
            <div className={`audit-feedback ${Math.abs(totalDifference) < 0.01 ? 'success' : 'warning-box'}`}>
              <div className="feedback-icon">{Math.abs(totalDifference) < 0.01 ? '✅' : '🚨'}</div>
              <div className="feedback-text">
                <span className="font-bold">
                  {Math.abs(totalDifference) < 0.01 
                    ? 'CAIXA CONFERIDO: Nenhuma divergência detectada.' 
                    : `DIVERGÊNCIA DETECTADA: ${totalDifference > 0 ? 'SOBRA' : 'FALTA'} DE R$ ${Math.abs(totalDifference).toFixed(2)}`}
                </span>
                {Math.abs(totalDifference) >= 0.01 && (
                  <p className="sub-text">Uma trilha de auditoria (AuditLog) será gerada automaticamente ao encerrar.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="closure-footer">
          <button className="btn-cancel font-bold" onClick={onCancel}>VOLTAR PARA VENDAS</button>
          <button 
            className={`btn-finalize font-black ${!hasInformed ? 'disabled' : ''}`}
            disabled={!hasInformed}
            onClick={() => onConfirm(parseFloat(informedCash))}
          >
            CONFIRMAR E ENCERRAR TURNO [F10]
          </button>
        </footer>
      </div>

      <style jsx>{`
        .closure-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .closure-modal {
          width: 750px;
          background: white;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .closure-header {
          background: var(--slate-900);
          color: white;
          padding: 1.5rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .status-label {
          font-size: 0.65rem;
          opacity: 0.5;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .closure-body {
          padding: 3rem;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        .section-label {
          display: block;
          font-size: 0.7rem;
          color: var(--slate-900);
          border-bottom: 2px solid var(--slate-900);
          padding-bottom: 0.5rem;
          margin-bottom: 1.25rem;
          letter-spacing: 0.05em;
        }
        .metric {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 0.75rem;
        }
        .highlight-fiado {
          color: var(--blue-700);
          padding-top: 0.75rem;
          border-top: 1px dashed var(--gray-200);
          margin-top: 1.25rem;
        }
        .cash-focus {
          background: var(--gray-50);
          padding: 1.5rem;
          border: 1px solid var(--gray-200);
        }
        .expected-total {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          color: var(--slate-900);
          border-top: 2px solid var(--slate-900);
          padding-top: 1rem;
        }
        .entry-zone {
          margin-top: 1rem;
        }
        .entry-zone label {
          font-size: 0.8rem;
          display: block;
          margin-bottom: 1rem;
          opacity: 0.6;
        }
        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 6px solid var(--slate-900);
          padding-bottom: 0.5rem;
        }
        .currency {
          font-size: 2rem;
          font-weight: 900;
          color: var(--slate-900);
          opacity: 0.2;
        }
        .physical-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 4rem;
          color: var(--slate-900);
          background: transparent;
          text-align: right;
        }
        .physical-input::-webkit-inner-spin-button,
        .physical-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .physical-input::placeholder {
          color: var(--gray-200);
        }
        .audit-feedback {
          margin-top: 2.5rem;
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
          align-items: center;
          border-radius: 2px;
        }
        .success {
          background: #f0fdf4;
          color: var(--emerald-600);
          border: 1px solid #bbf7d0;
        }
        .warning-box {
          background: #fef2f2;
          color: var(--red-600);
          border: 1px solid #fecaca;
        }
        .feedback-icon {
          font-size: 2.5rem;
        }
        .sub-text {
          font-size: 0.75rem;
          opacity: 0.8;
          margin-top: 0.25rem;
        }
        .closure-footer {
          padding: 2.5rem;
          background: var(--gray-50);
          display: flex;
          justify-content: flex-end;
          gap: 2rem;
          align-items: center;
        }
        .btn-finalize {
          background: var(--slate-900);
          color: white;
          padding: 1.5rem 3rem;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: transform 0.1s;
        }
        .btn-finalize:active {
          transform: scale(0.98);
        }
        .btn-finalize.disabled {
          background: var(--gray-200);
          color: var(--slate-800);
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-cancel {
          background: transparent;
          border: none;
          color: var(--slate-900);
          opacity: 0.4;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .btn-cancel:hover {
          opacity: 1;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
