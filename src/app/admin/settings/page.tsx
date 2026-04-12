'use client'

import React, { useState, useEffect } from 'react'
import { SettingsService } from '@/services/settings.service'
import { RoleWrapper } from '@/components/auth/RoleWrapper'

/**
 * SettingsPage - Exclusive to ADMIN role.
 * Manages global financial rules for the PDV system.
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const currentRole: 'ADMIN' | 'SELLER' = 'ADMIN'; // Mock for visibility

  useEffect(() => {
    SettingsService.getSettings().then(setSettings)
  }, [])

  if (!settings) return <div>Carregando regras de negócio...</div>

  return (
    <RoleWrapper role={currentRole} allowedRoles={['ADMIN']}>
      <div className="settings-page">
        <header className="page-header">
          <div className="title-area">
            <h1 className="font-black">CONFIGURAÇÕES</h1>
            <p className="font-medium opacity-50">REGRAS DE NEGÓCIO E TAXAS FINANCEIRAS</p>
          </div>
        </header>

        <div className="settings-container magazine-card">
          <section className="settings-section">
            <h2 className="font-black">PARAMETRIZAÇÃO DE FIADO</h2>
            <p className="section-desc font-medium">Configure as taxas que serão aplicadas automaticamente sobre saldos devedores vencidos.</p>

            <form className="settings-form">
               <div className="form-grid">
                  <div className="form-group">
                    <label className="font-bold">MULTA POR ATRASO (%)</label>
                    <div className="input-wrapper">
                      <input type="number" defaultValue={settings.lateFeePercentage} step="0.01" />
                      <span className="unit">%</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="font-bold">JUROS DE MORA MENSAL (%)</label>
                    <div className="input-wrapper">
                      <input type="number" defaultValue={settings.monthlyInterestRate} step="0.01" />
                      <span className="unit">%</span>
                    </div>
                  </div>
               </div>

               <div className="form-footer">
                  <p className="audit-info font-medium">Última atualização: {new Date(settings.updatedAt).toLocaleString('pt-BR')}</p>
                  <button type="submit" className="save-btn font-black">SALVAR REGRAS</button>
               </div>
            </form>
          </section>
        </div>

        <style jsx>{`
          .settings-page {
            padding: 3rem;
            max-width: 1000px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 4rem;
            border-bottom: 8px solid var(--slate-900);
            padding-bottom: 1.5rem;
          }

          .page-header h1 {
            font-size: 3rem;
            line-height: 0.8;
            margin-bottom: 0.5rem;
          }

          .settings-container {
            background: white;
            border: 4px solid var(--slate-900);
            padding: 4rem;
          }

          .settings-section h2 {
            font-size: 1.75rem;
            margin-bottom: 1rem;
            border-left: 10px solid var(--red-600);
            padding-left: 1rem;
          }

          .section-desc {
            opacity: 0.5;
            margin-bottom: 3rem;
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin-bottom: 4rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .form-group label {
            font-size: 0.8rem;
            letter-spacing: 0.1em;
          }

          .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-wrapper input {
             width: 100%;
             padding: 1.5rem;
             font-size: 2rem;
             font-weight: 900;
             border: 2px solid var(--slate-900);
             outline: none;
          }

          .input-wrapper .unit {
            position: absolute;
            right: 2rem;
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--slate-900);
            opacity: 0.3;
          }

          .form-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 2rem;
          }

          .audit-info {
            font-size: 0.8rem;
            opacity: 0.5;
          }

          .save-btn {
            background: var(--slate-900);
            color: white;
            padding: 1rem 3rem;
            border: none;
            cursor: pointer;
            transition: 0.2s;
          }

          .save-btn:hover {
            background: var(--red-600);
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </RoleWrapper>
  )
}
