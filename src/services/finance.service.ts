import { SettingsService } from './settings.service';

/**
 * FinanceService
 * Core engine for high-precision financial calculations.
 * Handles late fees (Multa) and pro-rata monthly interest (Juros de Mora).
 * Follows the 'Gravity Service Pattern'.
 */
export class FinanceService {
  /**
   * Calculates the granular breakdown of a debt including penalties.
   * @param principal The original amount owed (excluding previous fees)
   * @param dueDate The maturity date of the transaction
   */
  static async calculateOverdueFees(principal: number, dueDate: Date) {
    const settings = await SettingsService.getSettings();
    const today = new Date();
    
    // Normalize dates to midnight for consistent "day" counting
    const start = new Date(dueDate.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(0, 0, 0, 0));
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If not overdue, return early with zero charges
    if (diffDays <= 0) {
      return {
        principal,
        lateFee: 0,
        interest: 0,
        totalDue: principal,
        daysOverdue: 0,
        isOverdue: false
      };
    }

    // 1. Late Fee (Multa): Fixed percentage applied immediately after maturity.
    const lateFee = principal * (Number(settings.lateFeePercentage) / 100);

    // 2. Interest (Juros de Mora): Pro-rata per day calculation.
    // Monthly interest divided by 30 to reach the daily factor.
    const dailyInterestFactor = (Number(settings.monthlyInterestRate) / 100) / 30;
    const interest = principal * dailyInterestFactor * diffDays;

    return {
      principal,
      lateFee,
      interest,
      totalDue: principal + lateFee + interest,
      daysOverdue: diffDays,
      isOverdue: true
    };
  }

  /**
   * Consolidates the operational "health" by summing potential fees from all overdue sales.
   * In production, this would use a recursive aggregation in Prisma.
   */
  static async getPortfolioHealth() {
    // Simulation of total overdue principal across the entire database
    const totalPrincipalOverdue = 15400.00;
    
    // Weighted estimation based on current settings
    const settings = await SettingsService.getSettings();
    
    return {
      totalPrincipal: totalPrincipalOverdue,
      estimatedFines: totalPrincipalOverdue * (Number(settings.lateFeePercentage) / 100),
      estimatedInterest: totalPrincipalOverdue * (Number(settings.monthlyInterestRate) / 100) * 0.5, // Est. 15 days delay avg
      riskLevel: totalPrincipalOverdue > 10000 ? 'HIGH' : 'MODERATE'
    };
  }
}
