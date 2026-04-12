/**
 * CustomerService
 * Manages customer data, credit limits, and "caderninho" (debt) monitoring.
 * Follows the 'Gravity Service Pattern'.
 */
export class CustomerService {
  /**
   * Retrieves all customers with their current financial status.
   */
  static async getCustomers() {
    // In production, this would be a full Prisma query:
    // return await prisma.customer.findMany({ orderBy: { name: 'asc' } })
    
    return [
      { 
        id: 'c1', 
        name: 'JOÃO FAZENDEIRO', 
        document: '123.456.789-00', 
        whatsapp: '5535999999999', 
        credit_limit: 5000.00, 
        current_balance: -1250.40, // Negative balance means debt
        status: 'DEBT' 
      },
      { 
        id: 'c2', 
        name: 'MARIA DO LEITE', 
        document: '987.654.321-11', 
        whatsapp: '5535888888888', 
        credit_limit: 2000.00, 
        current_balance: 0.00, 
        status: 'OK' 
      },
      { 
        id: 'c3', 
        name: 'AGROVILA LTDA', 
        document: '11.222.333/0001-44', 
        whatsapp: '5535777777777', 
        credit_limit: 15000.00, 
        current_balance: -4500.00, 
        status: 'DEBT' 
      }
    ];
  }

  /**
   * Registers a new customer into the fiscal system.
   * Ensures LGPD compliance fields are initialized.
   */
  static async createCustomer(data: { name: string; document: string; whatsapp: string; credit_limit: number }) {
    console.log('[CUSTOMER] Creating new profile:', data);
    
    // In production environment:
    // return await prisma.customer.create({
    //   data: {
    //     ...data,
    //     current_balance: 0,
    //     data_consent: false
    //   }
    // })

    return { 
      success: true, 
      id: `cust-${Math.random().toString(36).substr(2, 9)}`,
      ...data 
    };
  }

  /**
   * Finalizes the payment of a pending debt.
   * Requires an audit trail to track if fees were applied or waived.
   */
  static async settleDebt(
    sellerId: string, 
    customerId: string, 
    paymentData: { principal: number; charges: number; forgiven: boolean }
  ) {
    console.log(`[DEBT_SETTLE] Customer ${customerId} by Seller ${sellerId}. Forgiven: ${paymentData.forgiven}`);

    // In production, update customer balance and close relevant sales...
    
    // Register high-priority audit log
    // In production: await AuditService.log(...)
    
    return {
      success: true,
      transactionId: `tx-${Date.now()}`,
      status: paymentData.forgiven ? 'SETTLED_WITH_WAIVER' : 'SETTLED_FULL'
    };
  }
}
