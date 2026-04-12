import { AuditService } from './audit.service'

/**
 * SaleService
 * Manages sales transactions, including 'fiado' (credit) logic and audit triggers.
 * Follows the 'Gravity Service Pattern'.
 */
export class SaleService {
  /**
   * Processes a new sale.
   * Checks for significant discounts and updates customer financial balance if necessary.
   * @param userId ID of the seller
   * @param data Sale data including items and payment method
   */
  static async processSale(userId: string, data: any) {
    const { customerId, items, payment_method } = data;
    
    // 1. Calculate totals and check for high discounts
    let grandTotal = 0;
    
    for (const item of items) {
      const lineTotal = item.price * item.quantity;
      grandTotal += lineTotal;

      // Business Rule: Audit discounts > 10%
      const discountPercentage = (item.original_price - item.price) / item.original_price;
      
      if (discountPercentage > 0.10) {
        await AuditService.log(userId, 'HIGH_DISCOUNT', {
          productId: item.productId,
          discount: `${(discountPercentage * 100).toFixed(2)}%`,
          originalPrice: item.original_price,
          salePrice: item.price
        });
      }
    }

    // 2. Manage 'Fiado' (Customer Balance)
    if (payment_method === 'FIADO') {
      console.log(`Updating customer ${customerId} balance by -${grandTotal}`);
      // In production:
      // await prisma.customer.update({
      //   where: { id: customerId },
      //   data: { current_balance: { decrement: grandTotal } }
      // })
    }

    return {
      success: true,
      sale_id: 'mock-sale-id',
      total: grandTotal
    };
  }
}
