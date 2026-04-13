/**
 * PDV Conception v2.0 - Formatting Utilities
 * Handles Brazilian currency and localizations.
 */

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const cleanPhone = (phone: string) => {
  return phone.replace(/\D/g, '')
}
