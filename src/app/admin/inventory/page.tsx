'use client'

import React, { useState, useEffect } from 'react'
import { ProductService } from '@/services/product.service'
import { RoleWrapper } from '@/components/auth/RoleWrapper'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const currentRole: 'ADMIN' | 'SELLER' = 'ADMIN'; // Simulation

  useEffect(() => {
    ProductService.getProducts(currentRole).then(setProducts)
  }, [])

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm)
  )

  return (
    <div className="inventory-page">
      <header className="page-header">
        <div className="title-area">
          <h1 className="font-black">ESTOQUE</h1>
          <p className="font-medium opacity-50">GERENCIAMENTO DE PRODUTOS E PREÇOS</p>
        </div>
        <button className="magazine-btn font-black">+ NOVO PRODUTO</button>
      </header>

      <div className="action-bar magazine-card">
        <input 
          type="text" 
          placeholder="BUSCAR POR NOME OU SKU..." 
          className="search-input font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container magazine-card">
        <table className="magazine-table">
          <thead>
            <tr className="font-black">
              <th>SKU</th>
              <th>PRODUTO</th>
              {currentRole === 'ADMIN' && <th>CUSTO (R$)</th>}
              <th>VENDA (R$)</th>
              <th>ESTOQUE</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className="font-bold">
                <td className="sku-cell">{product.sku}</td>
                <td>{product.name.toUpperCase()}</td>
                {currentRole === 'ADMIN' && (
                  <td className="cost-cell">R$ {product.cost_price.toFixed(2)}</td>
                )}
                <td className="sale-cell">R$ {product.sale_price.toFixed(2)}</td>
                <td>
                  <span className={`stock-badge ${product.stock_quantity < 5 ? 'low' : ''}`}>
                    {product.stock_quantity} UN
                  </span>
                </td>
                <td>
                  <button className="edit-btn">EDITAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .inventory-page {
          padding: 3rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
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
          transition: 0.2s;
        }

        .magazine-btn:hover {
          background: var(--red-600);
        }

        .action-bar {
          padding: 0;
          margin-bottom: 2rem;
          border: 2px solid var(--slate-900);
        }

        .search-input {
          width: 100%;
          border: none;
          padding: 1.5rem 2rem;
          font-size: 1.1rem;
          outline: none;
        }

        .table-container {
          padding: 0;
          border: 2px solid var(--slate-900);
          overflow: hidden;
        }

        .magazine-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .magazine-table th {
          background: var(--slate-900);
          color: white;
          padding: 1.25rem 2rem;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }

        .magazine-table td {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .sku-cell { opacity: 0.5; font-size: 0.8rem; }
        .cost-cell { color: var(--slate-900); font-style: italic; }
        .sale-cell { color: var(--blue-700); font-size: 1.2rem; }

        .stock-badge {
          background: #f1f5f9;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
        }

        .stock-badge.low {
          background: #fee2e2;
          color: var(--red-600);
        }

        .edit-btn {
          background: none;
          border: 1px solid var(--slate-900);
          color: var(--slate-900);
          padding: 0.5rem 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }

        .edit-btn:hover {
          background: var(--slate-900);
          color: white;
        }
      `}</style>
    </div>
  )
}
