'use client'

import React, { useEffect, useState } from 'react'
import { RoleWrapper } from '@/components/auth/RoleWrapper'
import { MetricCard } from '@/components/admin/MetricCard'
import { AnalyticsService } from '@/services/analytics.service'

/**
 * AdminAnalyticsPage - PDV Conception
 * Exclusive dashboard for administrators featuring high-contrast data cards.
 * Implements 'Magazine' style aesthetics with real-time operational triggers.
 */
export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  
  // Simulated user role (In production, this comes from an Auth Context)
  const currentRole = 'ADMIN' 

  useEffect(() => {
    AnalyticsService.getAdminMetrics().then(setMetrics)
  }, [])

  if (!metrics) {
    return (
      <div className="loading-state font-black">
        CONSOLIDANDO MÉTRICAS 2026...
      </div>
    )
  }

  const isBreakageCritical = metrics.breakage.weeklyAccumulated > metrics.breakage.alertThreshold

  return (
    <RoleWrapper role={currentRole} allowedRoles={['ADMIN']}>
      <div className="admin-analytics">
        {/* Header Section */}
        <header className="analytics-header">
          <div className="header-title">
            <h1 className="font-black">ADMIN ANALYTICS</h1>
            <p className="font-medium">PAINEL DE SAÚDE OPERACIONAL E FINANCEIRA</p>
          </div>
          <div className="header-status font-bold">
            STATUS: <span className="status-badge">SISTEMA ONLINE</span>
          </div>
        </header>

        {/* Weekly Breakage Trigger Alert */}
        {isBreakageCritical && (
          <div className="alert-trigger magazine-card">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <span className="font-black">ALERTA: QUEBRA DE CAIXA ACUMULADA (SEMANA)</span>
              <div className="alert-value font-black">R$ {metrics.breakage.weeklyAccumulated.toFixed(2)}</div>
              <p className="font-medium">O limite máximo permitido de R$ {metrics.breakage.alertThreshold.toFixed(2)} foi excedido.</p>
            </div>
          </div>
        )}

        <div className="kpi-grid">
          <MetricCard 
            label="Ticket Médio Diário" 
            value={`R$ ${metrics.daily.ticketMedio.toFixed(2)}`} 
            subValue={`Baseado em ${metrics.daily.salesCount} vendas hoje`}
            trend="up"
          />
          <MetricCard 
            label="Volume de Operações" 
            value={metrics.daily.salesCount} 
            subValue="Meta: 60/dia"
            variant="success"
            trend="up"
          />
        </div>

        {/* Saúde Financeira Section */}
        <section className="health-section magazine-card">
          <div className="section-header">
            <h2 className="font-black">PANORAMA DE SAÚDE FINANCEIRA</h2>
            <div className="risk-badge font-black">RISCO: {metrics.financialHealth.riskLevel}</div>
          </div>
          <div className="health-grid">
            <div className="health-item">
              <span className="label font-bold">PRINCIPAL EM ATRASO</span>
              <span className="value font-black">R$ {metrics.financialHealth.totalOverduePrincipal.toLocaleString('pt-BR')}</span>
            </div>
            <div className="health-item">
              <span className="label font-bold">MULTAS PREVISTAS</span>
              <span className="value font-black highlight-red">+ R$ {metrics.financialHealth.accruedFines.toLocaleString('pt-BR')}</span>
            </div>
            <div className="health-item">
              <span className="label font-bold">JUROS ACUMULADOS</span>
              <span className="value font-black highlight-red">+ R$ {metrics.financialHealth.accruedInterest.toLocaleString('pt-BR')}</span>
            </div>
            <div className="health-item total">
              <span className="label font-bold">TOTAL RECUPERÁVEL</span>
              <span className="value font-black">R$ {metrics.financialHealth.totalRecoverable.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </section>

        {/* Rankings Section */}
        <div className="rankings-container">
          {/* Top Products By Volume */}
          <section className="ranking-block magazine-card">
            <div className="block-header">
              <h2 className="font-black">PRODUTOS MAIS VENDIDOS [VOLUME]</h2>
            </div>
            <div className="ranking-list">
              {metrics.rankings.byVolume.map((p: any, i: number) => (
                <div key={i} className="ranking-item">
                  <span className="rank-num font-black">#{i + 1}</span>
                  <div className="rank-info">
                    <span className="item-name font-bold">{p.name}</span>
                    <span className="item-trend font-medium">{p.trend.toUpperCase()}</span>
                  </div>
                  <span className="rank-total font-black">{p.quantity} UN</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top Products By Margin */}
          <section className="ranking-block magazine-card">
            <div className="block-header">
              <h2 className="font-black">PRODUTOS POR MARGEM DE LUCRO</h2>
            </div>
            <div className="ranking-list">
              {metrics.rankings.byMargin.map((p: any, i: number) => (
                <div key={i} className="ranking-item">
                  <span className="rank-num font-black">#{i + 1}</span>
                  <div className="rank-info">
                    <span className="item-name font-bold">{p.name}</span>
                    <span className="item-profit font-medium">LUCRO: R$ {p.profit.toLocaleString('pt-BR')}</span>
                  </div>
                  <span className="rank-total font-black highlight-emerald">{(p.margin * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <style jsx>{`
          .admin-analytics {
            padding: 3rem;
            max-width: 1400px;
            margin: 0 auto;
            background: white;
          }
          .analytics-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 4rem;
            border-bottom: 12px solid var(--slate-900);
            padding-bottom: 1.5rem;
          }
          .header-title h1 {
            font-size: 4rem;
            line-height: 0.8;
            margin-bottom: 0.5rem;
          }
          .status-badge {
            background: var(--emerald-600);
            color: white;
            padding: 0.25rem 0.5rem;
            font-size: 0.65rem;
          }
          .alert-trigger {
            background: var(--red-600);
            color: white;
            padding: 2.5rem;
            display: flex;
            gap: 2rem;
            align-items: center;
            margin-bottom: 4rem;
          }
          .alert-icon { font-size: 3rem; }
          .alert-value { font-size: 2.5rem; line-height: 1.1; margin: 0.5rem 0; }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem;
            margin-bottom: 5rem;
          }
          .health-section {
            padding: 3rem;
            border: 8px solid var(--slate-900);
            margin-bottom: 5rem;
          }
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
            border-bottom: 2px solid var(--slate-900);
            padding-bottom: 1rem;
          }
          .risk-badge {
            background: var(--red-600);
            color: white;
            padding: 0.5rem 1rem;
            font-size: 0.8rem;
          }
          .health-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
          .health-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .health-item .label {
            font-size: 0.7rem;
            opacity: 0.6;
            letter-spacing: 0.05em;
          }
          .health-item .value {
            font-size: 1.75rem;
            letter-spacing: -0.02em;
          }
          .health-item.total {
            background: var(--slate-900);
            color: white;
            padding: 1rem;
            margin: -1rem;
          }
          .highlight-red { color: var(--red-600); }
          .rankings-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3.5rem;
          }
          .ranking-block {
            padding: 0;
            overflow: hidden;
            border: 2px solid var(--slate-900);
          }
          .block-header {
            background: var(--slate-900);
            color: white;
            padding: 1.25rem 2rem;
          }
          .ranking-list {
            padding: 1rem 0;
          }
          .ranking-item {
            display: grid;
            grid-template-columns: 60px 1fr 120px;
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--gray-200);
            align-items: center;
          }
          .ranking-item:last-child { border-bottom: none; }
          .rank-num { font-size: 1.5rem; color: var(--gray-200); }
          .rank-info { display: flex; flex-direction: column; }
          .item-name { font-size: 1.1rem; }
          .item-trend, .item-profit { font-size: 0.7rem; opacity: 0.5; }
          .rank-total { font-size: 1.5rem; text-align: right; }
          .highlight-emerald { color: var(--emerald-600); }
          .loading-state {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
          }
        `}</style>
      </div>
    </RoleWrapper>
  )
}
