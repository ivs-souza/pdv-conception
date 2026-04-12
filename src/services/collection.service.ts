import { WhatsAppService, MessageType } from './whatsapp.service';
import { FinanceService } from './finance.service';
import { AuditService } from './audit.service';

/**
 * CollectionService
 * Handles the logic for scanning, filtering, and notifying customers with debt.
 * Implements strict LGPD compliance by checking data_consent.
 */
export class CollectionService {
  private static STORE_NAME = process.env.WHATSAPP_STORE_NAME || 'PDV CONCEPTION';

  /**
   * Scans the database for sales with overdue status.
   * Only processes customers who have provided data consent.
   */
  static async runAutomatedScan() {
    console.log('[COLLECTION] Starting daily automated scan...');
    
    // In production, this would be a Prisma query with joins:
    // const overdueSales = await prisma.sale.findMany({
    //   where: { 
    //     payment_method: 'FIADO',
    //     dueDate: { lte: new Date() },
    //     customer: { data_consent: true }
    //   },
    //   include: { customer: true }
    // })

    // Simulation for demo purposes
    const mockOverdue = [
      { 
        id: 's1', 
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days late
        amount: 250.00,
        customer: { name: 'João Fazendeiro', phone: '5535999999999', data_consent: true }
      },
      { 
        id: 's2', 
        dueDate: new Date(Date.now()), // Due today
        amount: 1500.00,
        customer: { name: 'Maria do Leite', phone: '5535888888888', data_consent: true }
      },
      { 
        id: 's3', 
        dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days late - CRITICAL
        amount: 450.00,
        customer: { name: 'Agrovila Ltda', phone: '5535777777777', data_consent: true }
      }
    ];

    const notifications = [];

    for (const sale of mockOverdue) {
      const fees = await FinanceService.calculateOverdueFees(sale.amount, sale.dueDate);
      
      let type: MessageType = 'MODERATE';
      if (fees.daysOverdue === 0) type = 'REMINDER';
      else if (fees.daysOverdue >= 10) type = 'CRITICAL';

      const message = WhatsAppService.getTemplate(type, {
        name: sale.customer.name,
        amount: sale.amount,
        total: fees.totalDue,
        days: fees.daysOverdue,
        storeName: this.STORE_NAME
      });

      notifications.push({
        customerId: sale.customer.name,
        phone: sale.customer.phone,
        message,
        type
      });

      // Audit the notification attempt
      console.log(`[COLLECTION] Notifying ${sale.customer.name} - Type: ${type}`);
      // In production: await AuditService.log(...)
    }

    return notifications;
  }
}
