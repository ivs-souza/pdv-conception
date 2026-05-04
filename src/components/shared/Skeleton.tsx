import React from 'react'

/**
 * Sapphire v3.2 - Skeleton System
 * High-performance CSS-only shimmer effect.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
  )
}

export function KPISkeleton() {
  return (
    <div className="premium-card h-[180px] flex flex-col justify-between">
      <div className="flex justify-between">
        <Skeleton className="w-10 h-10" />
        <Skeleton className="w-12 h-4" />
      </div>
      <div className="space-y-3">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-full h-8" />
        <Skeleton className="w-32 h-3" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="premium-card h-[350px] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
           <Skeleton className="w-8 h-8" />
           <Skeleton className="w-40 h-4" />
        </div>
        <Skeleton className="w-20 h-6" />
      </div>
      <Skeleton className="flex-1 w-full" />
    </div>
  )
}
