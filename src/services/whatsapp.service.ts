/**
 * WhatsAppService
 * Manages message template generation and direct communication links.
 * Follows the 'Magazine/CNN' style of direct and clear communication.
 */

export type MessageType = 'REMINDER' | 'MODERATE' | 'CRITICAL';

export interface MessageContext {
  name: string;
  amount: number;
  total?: number;
  days?: number;
  storeName: string;
}

export class WhatsAppService {
  /**
   * Generates a formatted message based on the debt severity.
   */
  static getTemplate(type: MessageType, data: MessageContext): string {
    const amountStr = data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const totalStr = data.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    switch (type) {
      case 'REMINDER':
        return `Olá ${data.name}, sua conta na ${data.storeName} vence hoje (${amountStr}).`;
      
      case 'MODERATE':
        return `Olá ${data.name}, notamos que sua conta de ${amountStr} está pendente na ${data.storeName}. O valor atualizado com multa é ${totalStr}.`;
      
      case 'CRITICAL':
        return `Olá ${data.name}, sua pendência na ${data.storeName} completou ${data.days} dias. O valor total com juros diários é ${totalStr}. Segue o resumo para conferência: https://pdv-conception.com/recibo/${Math.random().toString(36).substr(2, 9)}`;
      
      default:
        return `Olá ${data.name}, você possui uma pendência de ${amountStr} na ${data.storeName}.`;
    }
  }

  /**
   * Generates a wa.me link for manual triggering.
   */
  static generateDirectLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
}
