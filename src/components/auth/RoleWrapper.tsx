'use client'

import React from 'react'

interface RoleWrapperProps {
  role: 'ADMIN' | 'SELLER'
  allowedRoles: ('ADMIN' | 'SELLER')[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * RoleWrapper Component
 * Handles conditional visibility based on User Role.
 * Essential for the 'PDV Conception' logic where SELLERs cannot see sensitive metrics.
 */
export function RoleWrapper({ role, allowedRoles, children, fallback = null }: RoleWrapperProps) {
  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
