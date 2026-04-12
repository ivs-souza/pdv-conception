'use client'

import React, { useState } from 'react'

interface SearchPaletteProps {
  onSelect: (product: any) => void
}

/**
 * SearchPalette Component
 * High-speed input inspired by Command Palettes.
 * Accepts SKU, Name, or Barcode and triggers immediate cart addition.
 */
export function SearchPalette({ onSelect }: SearchPaletteProps) {
  const [query, setQuery] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      // Simulation of a database lookup / UX Velocity
      const mockProduct = {
        id: Math.random().toString(36).substr(2, 9),
        name: query.toUpperCase(),
        sku: `SKU-${Math.floor(Math.random() * 1000)}`,
        sale_price: 150.0 + Math.floor(Math.random() * 50)
      }
      
      onSelect(mockProduct)
      setQuery('')
    }
  }

  return (
    <div className="search-palette">
      <div className="search-inner">
        <label className="search-label">BUSCA RÁPIDA (SKU / NOME / BARRAS):</label>
        <div className="search-field">
          <input
            type="text"
            autoFocus
            className="search-input"
            placeholder="Digite e pressione 'ENTER' para lançar..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="search-kbd">⌘ Enter</div>
        </div>
      </div>
      <style jsx>{`
        .search-palette {
          background: var(--slate-900);
          padding: 2rem;
          border-radius: 4px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .search-label {
          color: var(--slate-100);
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 0.75rem;
          opacity: 0.6;
        }
        .search-field {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 2rem;
          font-weight: 700;
          outline: none;
          text-transform: uppercase;
        }
        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.1);
          font-weight: 500;
        }
        .search-kbd {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}
