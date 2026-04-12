import { Type, Static } from '@sinclair/typebox'

/**
 * Role enumeration for Users
 */
export const Role = Type.Union([
  Type.Literal('ADMIN'),
  Type.Literal('SELLER')
])

/**
 * User Schema
 */
export const UserSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String(),
  role: Role,
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

/**
 * Product Schema
 * Includes cost_price (classified as sensitive data)
 */
export const ProductSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  sku: Type.String(),
  sale_price: Type.Number({ minimum: 0 }),
  cost_price: Type.Number({ minimum: 0 }), // SENSITIVE
  stock_quantity: Type.Integer({ minimum: 0 }),
  ncm: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

/**
 * Customer Schema
 * Features tracking for credit limit and current balance (fiado)
 */
export const CustomerSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  name: Type.String(),
  document: Type.String(), // CPF or CNPJ
  whatsapp: Type.Optional(Type.String()),
  credit_limit: Type.Number({ minimum: 0 }),
  current_balance: Type.Number(), // Positive or negative depending on debit/credit
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

/**
 * Sale Item Schema
 */
export const SaleItemSchema = Type.Object({
  productId: Type.String({ format: 'uuid' }),
  quantity: Type.Integer({ minimum: 1 }),
  price: Type.Number({ minimum: 0 }) // Unit price at the time of sale
})

/**
 * Sale Schema
 */
export const SaleSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  customerId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }), // Seller ID
  items: Type.Array(SaleItemSchema, { minItems: 1 }),
  payment_method: Type.String(),
  total_amount: Type.Number({ minimum: 0 }),
  createdAt: Type.String({ format: 'date-time' })
})

/**
 * Cash Session Status enumeration
 */
export const CashSessionStatus = Type.Union([
  Type.Literal('OPEN'),
  Type.Literal('CLOSED')
])

/**
 * Cash Session Schema
 */
export const CashSessionSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  openedAt: Type.String({ format: 'date-time' }),
  closedAt: Type.Optional(Type.String({ format: 'date-time' })),
  initialAmount: Type.Number({ minimum: 0 }),
  finalAmount: Type.Optional(Type.Number()),
  status: CashSessionStatus
})

// Types exported for use in the application
export type User = Static<typeof UserSchema>
export type Product = Static<typeof ProductSchema>
export type Customer = Static<typeof CustomerSchema>
export type Sale = Static<typeof SaleSchema>
export type CashSession = Static<typeof CashSessionSchema>
export type SaleItem = Static<typeof SaleItemSchema>
