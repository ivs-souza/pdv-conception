/**
 * Sapphire v2.0 - Formatting Utilities
 * Handles Brazilian currency and localizations.
 */

export const formatCurrency = (value: number | undefined | null) => {
  const safeValue = typeof value === 'number' ? value : 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safeValue)
}

export const cleanPhone = (phone: string) => {
  return phone.replace(/\D/g, '')
}
