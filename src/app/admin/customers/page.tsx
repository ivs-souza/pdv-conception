'use client'

import React, { useState, useEffect } from 'react'
import { CustomerService } from '@/services/customer.service'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    CustomerService.getCustomers().then(setCustomers)
  }, [])

  return (
    <div className="customers-page">
      <header className="page-header">
        <div className="title-area">
          <h1 className="font-black">CLIENTES</h1>
          <p className="font-medium opacity-50">GESTÃO DE CRÉDITO E CARTEIRA</p>
        </div>
        <button 
          className="magazine-btn font-black"
          onClick={() => setShowModal(true)}
        >
          + NOVO CLIENTE
        </button>
      </header>

      <div className="customers-grid">
        {customers.map(customer => (
          <div key={customer.id} className="customer-card magazine-card">
            <div className="card-header">
              <h2 className="font-black">{customer.name.toUpperCase()}</h2>
              <span className={`status-badge font-black ${customer.status}`}>
                {customer.status === 'DEBT' ? 'PENDENTE' : 'EM DIA'}
              </span>
            </div>
            
            <div className="card-body">
              <div className="info-row">
                <span className="label font-bold">DOCUMENTO:</span>
                <span className="value font-medium">{customer.document}</span>
              </div>
              <div className="info-row">
                <span className="label font-bold">WHATSAPP:</span>
                <span className="value font-medium">{customer.whatsapp}</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="balance-info">
                <span className="label font-bold">SALDO ATUAL:</span>
                <span className={`balance-val font-black ${customer.current_balance < 0 ? 'debt' : ''}`}>
                  R$ {customer.current_balance.toFixed(2)}
                </span>
              </div>
              <div className="limit-info">
                <span className="label font-bold">LIMITE:</span>
                <span className="value font-black">R$ {customer.credit_limit.toFixed(2)}</span>
              </div>
            </div>

            {customer.status === 'DEBT' && (
              <div className="card-actions-debt">
                <button 
                  className="whatsapp-btn font-black"
                  onClick={() => {
                    const msg = `Olá ${customer.name}, notamos que sua conta de R$ ${Math.abs(customer.current_balance).toFixed(2)} está pendente. Por favor, entre em contato para quitação atualizada.`;
                    window.open(`https://wa.me/${customer.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                >
                  ENVIAR COBRANÇA WHATSAPP
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content magazine-card">
             <h2 className="font-black">CADASTRAR NOVO CLIENTE</h2>
             <form className="modal-form">
                <div className="form-group">
                  <label className="font-bold">NOME COMPLETO</label>
                  <input type="text" placeholder="Ex: Joaquim Silva" />
                </div>
                <div className="form-group">
                  <label className="font-bold">CPF/CNPJ</label>
                  <input type="text" placeholder="000.000.000-00" />
                </div>
                <div className="row">
                   <div className="form-group">
                     <label className="font-bold">WHATSAPP</label>
                     <input type="text" placeholder="55..." />
                   </div>
                   <div className="form-group">
                     <label className="font-bold">LIMITE INICIAL</label>
                     <input type="number" placeholder="500.00" />
                   </div>
                </div>
                <div className="form-actions">
                   <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>CANCELAR</button>
                   <button type="submit" className="save-btn font-black">CADASTRAR</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .customers-page {
          padding: 3rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 4rem;
          border-bottom: 8px solid var(--slate-900);
          padding-bottom: 1.5rem;
        }

        .page-header h1 {
          font-size: 3rem;
          line-height: 0.8;
          margin-bottom: 0.5rem;
        }

        .magazine-btn {
          background: var(--slate-900);
          color: white;
          border: none;
          padding: 1rem 2rem;
          cursor: pointer;
        }

        .customers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .customer-card {
           padding: 2rem;
           border: 2px solid var(--slate-900);
           display: flex;
           flex-direction: column;
           gap: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--slate-900);
          padding-bottom: 1rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          font-size: 0.7rem;
        }

        .status-badge.OK { background: var(--emerald-600); color: white; }
        .status-badge.DEBT { background: var(--red-600); color: white; }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .label { opacity: 0.6; font-size: 0.75rem; }

        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          background: #f8fafc;
          padding: 1rem;
        }

        .card-actions-debt {
          margin-top: 1rem;
          padding: 0;
        }

        .whatsapp-btn {
          width: 100%;
          background: var(--slate-900);
          color: white;
          border: none;
          padding: 1rem;
          font-size: 0.8rem;
          cursor: pointer;
          border-left: 8px solid var(--emerald-600);
          transition: 0.2s;
        }

        .whatsapp-btn:hover {
          background: var(--emerald-600);
          transform: translateY(-2px);
        }

        .balance-val { font-size: 1.25rem; }
        .balance-val.debt { color: var(--red-600); }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
           background: white;
           padding: 3rem;
           max-width: 600px;
           width: 100%;
           border: 8px solid var(--slate-900);
        }

        .modal-form {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group input {
          border: 2px solid var(--slate-900);
          padding: 0.75rem 1rem;
          outline: none;
        }

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }

        .cancel-btn {
          background: none;
          border: none;
          color: var(--slate-900);
          font-weight: bold;
          cursor: pointer;
        }

        .save-btn {
          background: var(--slate-900);
          color: white;
          padding: 0.75rem 2rem;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
