import { Type, Static } from '@sinclair/typebox'
import { ProductSchema } from './types'

/**
 * ProductAdminDTO
 * Full access to product data, including sensitive financial fields.
 */
export const ProductAdminDTO = Type.Composite([
  ProductSchema
])

/**
 * ProductSellerDTO
 * Restricted view for SELLER users. 
 * The cost_price is explicitly nullified to prevent sensitive data leakage.
 */
export const ProductSellerDTO = Type.Composite([
  Type.Omit(ProductSchema, ['cost_price']),
  Type.Object({
    cost_price: Type.Null()
  })
])

/**
 * FinancialReportDTO
 * Structure for high-level financial reports accessible only by ADMIN.
 */
export const FinancialReportDTO = Type.Object({
  total_revenue: Type.Number(),
  profit_margin: Type.Number(),
  monthly_taxes: Type.Number(),
  period: Type.String(),
  generated_at: Type.String({ format: 'date-time' })
})

/**
 * CashSessionSummaryDTO
 * Limited view of the current cash session for SELLER users.
 */
export const CashSessionSummaryDTO = Type.Object({
  id: Type.String({ format: 'uuid' }),
  openedAt: Type.String({ format: 'date-time' }),
  initialAmount: Type.Number(),
  current_sales_total: Type.Number(),
  status: Type.String()
})

export type ProductAdmin = Static<typeof ProductAdminDTO>
export type ProductSeller = Static<typeof ProductSellerDTO>
export type FinancialReport = Static<typeof FinancialReportDTO>
export type CashSessionSummary = Static<typeof CashSessionSummaryDTO>
