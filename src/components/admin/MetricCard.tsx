'use client'

import React from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'stable'
  variant?: 'default' | 'danger' | 'success'
}

/**
 * MetricCard Component
 * Implements the 'Magazine' style for analytical metrics.
 * Designed for immediate data comprehension through high contrast.
 */
export function MetricCard({ label, value, subValue, trend, variant = 'default' }: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '';
  }

  return (
    <div className={`metric-card magazine-card variant-${variant}`}>
      <div className="label-area">
        <span className="metric-label font-bold">{label.toUpperCase()}</span>
      </div>
      <div className="value-area">
        <span className="metric-value font-black">{value}</span>
      </div>
      {(subValue || trend) && (
        <div className="footer-area">
          {trend && <span className={`trend-icon trend-${trend}`}>{getTrendIcon()}</span>}
          {subValue && <span className="metric-subvalue font-medium">{subValue}</span>}
        </div>
      )}

      <style jsx>{`
        .metric-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-left: 6px solid var(--slate-900);
        }
        .metric-label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          opacity: 0.5;
          color: var(--slate-900);
        }
        .metric-value {
          font-size: 3rem;
          line-height: 1;
          color: var(--slate-900);
        }
        .footer-area {
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        .trend-icon {
          font-weight: 900;
        }
        .trend-up { color: var(--emerald-600); }
        .trend-down { color: var(--red-600); }
        .metric-subvalue {
          opacity: 0.6;
        }

        .variant-danger {
          border-left-color: var(--red-600);
          background-color: #fffcfc;
        }
        .variant-danger .metric-value {
          color: var(--red-600);
        }
        .variant-success {
          border-left-color: var(--emerald-600);
        }
      `}</style>
    </div>
  )
}
