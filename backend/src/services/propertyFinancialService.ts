import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PropertyFinancials {
  // Income
  monthlyRentalIncome: number;
  otherMonthlyIncome: number;
  grossMonthlyIncome: number;
  vacancyLoss: number;
  effectiveMonthlyIncome: number;
  annualRentalIncome: number;
  annualOtherIncome: number;
  grossAnnualIncome: number;

  // Expenses
  monthlyOperatingExpenses: number;
  annualOperatingExpenses: number;

  // Net Operating Income
  monthlyNOI: number;
  annualNOI: number;

  // Cash Flow
  monthlyMortgagePayment: number;
  monthlyCashFlow: number;
  annualCashFlow: number;

  // Investment Metrics
  totalInvestment: number;
  equity: number;
  capRate: number;
  cashOnCashReturn: number;
  returnOnEquity: number;

  // Loan Metrics
  loanToValue: number;
  debtServiceCoverageRatio: number;

  // Rules of Thumb
  onePercentRule: boolean;
  onePercentRuleValue: number;
  twoPercentRule: boolean;
  twoPercentRuleValue: number;
  rule135: boolean;
  rule135Value: number;
}

export class PropertyFinancialService {
  /**
   * Calculate comprehensive financial metrics for a property
   */
  static async calculateFinancials(propertyId: string): Promise<PropertyFinancials> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        leases: {
          where: { isActive: true },
        },
        additionalIncome: {
          where: { isActive: true },
        },
        expenseTemplate: true,
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Calculate Income
    const monthlyRentalIncome = property.leases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

    const otherMonthlyIncome = property.additionalIncome
      .filter((income) => income.frequency === 'MONTHLY')
      .reduce((sum, income) => sum + income.amount, 0);

    const grossMonthlyIncome = monthlyRentalIncome + otherMonthlyIncome;

    const vacancyRate = property.vacancyRatePercent || 0;
    const vacancyLoss = grossMonthlyIncome * (vacancyRate / 100);
    const effectiveMonthlyIncome = grossMonthlyIncome - vacancyLoss;

    const annualRentalIncome = monthlyRentalIncome * 12;
    const annualOtherIncome = otherMonthlyIncome * 12;
    const grossAnnualIncome = grossMonthlyIncome * 12;

    // Calculate Expenses
    const expenses = property.expenseTemplate;
    const monthlyOperatingExpenses = expenses
      ? (expenses.propertyManagementFee || 0) +
        (expenses.accountingLegalFees || 0) +
        (expenses.repairsMaintenance || 0) +
        (expenses.pestControl || 0) +
        (expenses.realEstateTaxes || 0) +
        (expenses.propertyInsurance || 0) +
        (expenses.hoaFees || 0) +
        (expenses.waterSewer || 0) +
        (expenses.gasElectricity || 0) +
        (expenses.garbage || 0) +
        (expenses.cablePhoneInternet || 0) +
        (expenses.advertising || 0)
      : 0;

    const annualOperatingExpenses = monthlyOperatingExpenses * 12;

    // Net Operating Income
    const monthlyNOI = effectiveMonthlyIncome - monthlyOperatingExpenses;
    const annualNOI = monthlyNOI * 12;

    // Cash Flow (after debt service)
    const monthlyMortgagePayment = property.monthlyMortgagePayment || 0;
    const monthlyCashFlow = monthlyNOI - monthlyMortgagePayment;
    const annualCashFlow = monthlyCashFlow * 12;

    // Investment Metrics
    const purchasePrice = property.purchasePrice;
    const refurbishCosts = property.refurbishCosts || 0;
    const furnishCosts = property.furnishCosts || 0;
    const acquisitionCosts = property.acquisitionCosts || 0;
    const totalInvestment = property.downPayment || purchasePrice + refurbishCosts + furnishCosts + acquisitionCosts;

    const currentValue = property.currentValue;
    const loanBalance = property.loanBalance;
    const equity = currentValue - loanBalance;

    // Capitalization Rate (NOI / Purchase Price)
    const capRate = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;

    // Cash on Cash Return (Annual Cash Flow / Total Cash Invested)
    const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

    // Return on Equity (Annual Net Income / Equity)
    const returnOnEquity = equity > 0 ? (annualCashFlow / equity) * 100 : 0;

    // Loan Metrics
    const loanToValue = currentValue > 0 ? (loanBalance / currentValue) * 100 : 0;
    const annualDebtService = monthlyMortgagePayment * 12;
    const debtServiceCoverageRatio = annualDebtService > 0 ? annualNOI / annualDebtService : 0;

    // Rules of Thumb
    // 1% Rule: Monthly rent should be at least 1% of purchase price
    const onePercentRuleValue = purchasePrice * 0.01;
    const onePercentRule = monthlyRentalIncome >= onePercentRuleValue;

    // 2% Rule: Monthly rent should be at least 2% of purchase price
    const twoPercentRuleValue = purchasePrice * 0.02;
    const twoPercentRule = monthlyRentalIncome >= twoPercentRuleValue;

    // 1.35 Rule: Monthly rent × 1.35 should equal or exceed monthly mortgage payment
    const rule135Value = monthlyRentalIncome * 1.35;
    const rule135 = rule135Value >= monthlyMortgagePayment;

    return {
      // Income
      monthlyRentalIncome,
      otherMonthlyIncome,
      grossMonthlyIncome,
      vacancyLoss,
      effectiveMonthlyIncome,
      annualRentalIncome,
      annualOtherIncome,
      grossAnnualIncome,

      // Expenses
      monthlyOperatingExpenses,
      annualOperatingExpenses,

      // Net Operating Income
      monthlyNOI,
      annualNOI,

      // Cash Flow
      monthlyMortgagePayment,
      monthlyCashFlow,
      annualCashFlow,

      // Investment Metrics
      totalInvestment,
      equity,
      capRate,
      cashOnCashReturn,
      returnOnEquity,

      // Loan Metrics
      loanToValue,
      debtServiceCoverageRatio,

      // Rules of Thumb
      onePercentRule,
      onePercentRuleValue,
      twoPercentRule,
      twoPercentRuleValue,
      rule135,
      rule135Value,
    };
  }

  /**
   * Calculate monthly mortgage payment using amortization formula
   */
  static calculateMonthlyPayment(
    principal: number,
    annualInterestRate: number,
    termYears: number
  ): number {
    if (principal <= 0 || termYears <= 0) return 0;

    const monthlyRate = annualInterestRate / 12 / 100;
    const numberOfPayments = termYears * 12;

    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }

    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return monthlyPayment;
  }

  /**
   * Get detailed expense breakdown
   */
  static async getExpenseBreakdown(propertyId: string) {
    const expenses = await prisma.propertyExpenseTemplate.findUnique({
      where: { propertyId },
    });

    if (!expenses) {
      return {
        management: 0,
        maintenance: 0,
        taxesInsurance: 0,
        utilities: 0,
        other: 0,
        total: 0,
      };
    }

    const management = (expenses.propertyManagementFee || 0) + (expenses.accountingLegalFees || 0);
    const maintenance = (expenses.repairsMaintenance || 0) + (expenses.pestControl || 0);
    const taxesInsurance =
      (expenses.realEstateTaxes || 0) + (expenses.propertyInsurance || 0) + (expenses.hoaFees || 0);
    const utilities =
      (expenses.waterSewer || 0) +
      (expenses.gasElectricity || 0) +
      (expenses.garbage || 0) +
      (expenses.cablePhoneInternet || 0);
    const other = expenses.advertising || 0;
    const total = management + maintenance + taxesInsurance + utilities + other;

    return {
      management,
      maintenance,
      taxesInsurance,
      utilities,
      other,
      total,
      details: {
        propertyManagementFee: expenses.propertyManagementFee || 0,
        accountingLegalFees: expenses.accountingLegalFees || 0,
        repairsMaintenance: expenses.repairsMaintenance || 0,
        pestControl: expenses.pestControl || 0,
        realEstateTaxes: expenses.realEstateTaxes || 0,
        propertyInsurance: expenses.propertyInsurance || 0,
        hoaFees: expenses.hoaFees || 0,
        waterSewer: expenses.waterSewer || 0,
        gasElectricity: expenses.gasElectricity || 0,
        garbage: expenses.garbage || 0,
        cablePhoneInternet: expenses.cablePhoneInternet || 0,
        advertising: expenses.advertising || 0,
      },
    };
  }

  /**
   * Get income breakdown
   */
  static async getIncomeBreakdown(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        leases: {
          where: { isActive: true },
        },
        additionalIncome: {
          where: { isActive: true },
        },
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const rentalIncome = property.leases.reduce((sum, lease) => sum + lease.monthlyRent, 0);

    const additionalIncomeByType = property.additionalIncome.reduce((acc, income) => {
      const monthlyAmount = income.frequency === 'MONTHLY' ? income.amount : income.amount / 12;
      acc[income.incomeType] = (acc[income.incomeType] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);

    const totalAdditionalIncome = Object.values(additionalIncomeByType).reduce((sum, val) => sum + val, 0);

    return {
      rentalIncome,
      additionalIncome: additionalIncomeByType,
      totalAdditionalIncome,
      totalMonthlyIncome: rentalIncome + totalAdditionalIncome,
    };
  }
}
