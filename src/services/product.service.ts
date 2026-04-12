import { AuditService } from './audit.service'

/**
 * ProductService
 * Handles business logic for products, including role-based data filtering.
 * Follows the 'Gravity Service Pattern'.
 */
export class ProductService {
  /**
   * Retrieves products with field filtering based on the user's role.
   * ADMINs see cost_price, SELLERs see cost_price as null.
   * @param role User role from auth context
   */
  static async getProducts(role: 'ADMIN' | 'SELLER') {
    // In production: const products = await prisma.product.findMany()
    const products: any[] = [
      { id: '1', name: 'Product A', sale_price: 150.0, cost_price: 90.0, stock_quantity: 10 },
      { id: '2', name: 'Product B', sale_price: 200.0, cost_price: 120.0, stock_quantity: 5 }
    ];

    return products.map(product => {
      if (role === 'SELLER') {
        // Redact cost_price for non-admin users
        return { ...product, cost_price: null };
      }
      return product;
    });
  }

  /**
   * Updates a product's price and triggers an audit log.
   * @param userId The ID of the authenticated user
   * @param productId The ID of the product to update
   * @param newPrice The new sale price
   */
  static async updateProductPrice(userId: string, productId: string, newPrice: number) {
    // 1. Fetch current state for audit comparison
    const oldPrice = 140.0; // Mock current price

    // 2. Perform update
    console.log(`Updating product ${productId} to price ${newPrice}`);

    // 3. Register high-sensitivity audit log
    await AuditService.log(userId, 'PRICE_CHANGE', {
      productId,
      before: oldPrice,
      after: newPrice,
      diff_percentage: ((newPrice - oldPrice) / oldPrice) * 100
    });

    return { id: productId, sale_price: newPrice };
  }

  /**
   * Registers a new product into the inventory.
   * Restricted to users with elevated permissions (ADMIN).
   */
  static async createProduct(data: { name: string; sku: string; cost_price: number; sale_price: number; stock_quantity: number; ncm: string }) {
    console.log('[PRODUTO] Creating new inventory entry:', data);
    
    // In production:
    // return await prisma.product.create({ data })

    return { 
      success: true, 
      id: `prod-${Math.random().toString(36).substr(2, 9)}`,
      ...data 
    };
  }
}
