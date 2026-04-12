'use client'

/**
 * WhatsApp Smart Link Utility
 * Generates formatted, commercial-grade messages for customers.
 * Includes 'caderninho' (fiado) awareness for 2026 digital tracking.
 */
export interface SaleSummary {
  storeName: string
  customerName: string
  items: Array<{ name: string, quantity: number }>
  total: number
  paymentMethod: string
  updatedBalance?: number
}

/**
 * Generates a WhatsApp wa.me link with a pre-filled, elegant message.
 * Ensures the message is formatted for high readability in a business context.
 * 
 * @param phone Customer phone number with country code (e.g., 5535999999999)
 * @param data Sale summary data including items and financial status
 */
export function generateWhatsAppReceiptLink(phone: string, data: SaleSummary): string {
  const { storeName, customerName, items, total, paymentMethod, updatedBalance } = data;
  
  // Using high-contrast formatting and emojis for professional UX
  let text = `*📦 ${storeName.toUpperCase()} - RECIBO DIGITAL*\n\n`;
  text += `Olá, *${customerName || 'Cliente'}*!\n`;
  text += `Confirmamos seu pedido realizado agora:\n\n`;
  
  items.forEach(item => {
    text += `▫️ ${item.quantity}x ${item.name.toUpperCase()}\n`;
  });
  
  text += `\n*💰 TOTAL: R$ ${total.toFixed(2)}*`;
  text += `\n💳 *MEIO DE PAGAMENTO:* ${paymentMethod.replace('_', ' ').toUpperCase()}`;
  
  // 'Caderninho' Awareness (FIADO)
  if (paymentMethod === 'CONTA_CLIENTE' && updatedBalance !== undefined) {
    text += `\n\n────────────────\n`;
    text += `📝 *CONTROLE DO CADERNINHO:*\n`;
    text += `Seu saldo devedor total agora é *R$ ${updatedBalance.toFixed(2)}*.`;
  }
  
  text += `\n\n_Obrigado pela preferência e até a próxima!_ 👋`;
  text += `\n_${storeName} System 2026_`;

  // Sanitize phone (removes symbols and keeps only numbers)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Fallback for cases where phone doesn't have country code (assumes Brazil +55)
  const finalPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
  
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${finalPhone}?text=${encodedText}`;
}
