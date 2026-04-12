/**
 * SettingsService
 * Manages global business rules such as late fees and interest rates.
 * Follows the 'Gravity Service Pattern'.
 */
export class SettingsService {
  /**
   * Retrieves the global settings. 
   * Defaults to pre-defined business rules if none exist in DB.
   */
  static async getSettings() {
    // In production environment:
    // return await prisma.settings.findFirst() || { lateFeePercentage: 2, monthlyInterestRate: 1 }
    
    return {
      lateFeePercentage: 2.00,
      monthlyInterestRate: 1.00,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Updates the global business rules.
   * Restricted to ADMIN role at the controller/route level.
   */
  static async updateSettings(data: { lateFeePercentage: number; monthlyInterestRate: number }) {
    console.log('[SETTINGS] Updating global rules:', data);
    
    // In production:
    // await prisma.settings.upsert({
    //   where: { id: 'global-settings' },
    //   update: data,
    //   create: { id: 'global-settings', ...data }
    // })

    return { 
      success: true, 
      updatedAt: new Date().toISOString() 
    };
  }
}
