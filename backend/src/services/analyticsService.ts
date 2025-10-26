import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * Get portfolio summary across all properties for a user
   */
  static async getPortfolioSummary(userId: string): Promise<{
    totalProperties: number;
    totalValue: number;
    totalEquity: number;
    totalDebt: number;
    averageCapRate: number;
    averageCashOnCashReturn: number;
    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    occupancyRate: number;
    properties: Array<{
      id: string;
      address: string;
      city: string;
      state: string;
      currentValue: number;
      equity: number;
      capRate: number;
      cashOnCashReturn: number;
    }>;
  }> {
    const properties = await prisma.property.findMany({
      where: { userId },
      include: {
        expenseTemplate: true,
        additionalIncome: {
          where: { isActive: true },
        },
        tenants: {
          where: { isActive: true },
        },
        leases: {
          where: { isActive: true },
        },
      },
    });

    const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0);
    const totalEquity = properties.reduce(
      (sum, p) => sum + (p.currentValue - p.loanBalance),
      0
    );
    const totalDebt = properties.reduce((sum, p) => sum + p.loanBalance, 0);

    // Calculate monthly income for each property
    const propertyMetrics = properties.map((p) => {
      const monthlyIncome =
        p.additionalIncome?.reduce((inc, i) => {
          let monthly = i.amount;
          if (i.frequency === 'QUARTERLY') monthly = i.amount / 3;
          if (i.frequency === 'ANNUALLY') monthly = i.amount / 12;
          if (i.frequency === 'ONE_TIME') monthly = 0;
          return inc + monthly;
        }, 0) || 0;

      const template = p.expenseTemplate;
      const monthlyExpenses = template
        ? (template.propertyManagementFee || 0) +
          (template.accountingLegalFees || 0) +
          (template.repairsMaintenance || 0) +
          (template.pestControl || 0) +
          (template.realEstateTaxes || 0) +
          (template.propertyInsurance || 0) +
          (template.hoaFees || 0) +
          (template.waterSewer || 0) +
          (template.gasElectricity || 0) +
          (template.garbage || 0) +
          (template.cablePhoneInternet || 0) +
          (template.advertising || 0) +
          (p.monthlyMortgagePayment || 0)
        : p.monthlyMortgagePayment || 0;

      const annualIncome = monthlyIncome * 12;
      const annualExpenses = monthlyExpenses * 12;
      const noi = annualIncome - annualExpenses;
      const capRate = p.currentValue > 0 ? (noi / p.currentValue) * 100 : 0;

      const totalInvested =
        p.purchasePrice +
        (p.refurbishCosts || 0) +
        (p.furnishCosts || 0) +
        (p.acquisitionCosts || 0);
      const cashOnCashReturn =
        totalInvested > 0
          ? ((monthlyIncome - monthlyExpenses) * 12 / totalInvested) * 100
          : 0;

      return {
        id: p.id,
        address: p.address,
        city: p.city,
        state: p.state,
        currentValue: p.currentValue,
        equity: p.currentValue - p.loanBalance,
        capRate,
        cashOnCashReturn,
        monthlyIncome,
        monthlyExpenses,
      };
    });

    const totalMonthlyIncome = propertyMetrics.reduce(
      (sum, p) => sum + p.monthlyIncome,
      0
    );
    const totalMonthlyExpenses = propertyMetrics.reduce(
      (sum, p) => sum + p.monthlyExpenses,
      0
    );

    const averageCapRate =
      propertyMetrics.length > 0
        ? propertyMetrics.reduce((sum, p) => sum + p.capRate, 0) /
          propertyMetrics.length
        : 0;

    const averageCashOnCashReturn =
      propertyMetrics.length > 0
        ? propertyMetrics.reduce((sum, p) => sum + p.cashOnCashReturn, 0) /
          propertyMetrics.length
        : 0;

    // Calculate occupancy rate (properties with active tenants / total properties)
    const occupiedProperties = properties.filter(
      (p) => p.tenants && p.tenants.length > 0
    ).length;
    const occupancyRate =
      properties.length > 0
        ? (occupiedProperties / properties.length) * 100
        : 0;

    return {
      totalProperties: properties.length,
      totalValue,
      totalEquity,
      totalDebt,
      averageCapRate,
      averageCashOnCashReturn,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      occupancyRate,
      properties: propertyMetrics,
    };
  }

  /**
   * Compare multiple properties side-by-side
   */
  static async compareProperties(propertyIds: string[]): Promise<any> {
    const properties = await prisma.property.findMany({
      where: {
        id: {
          in: propertyIds,
        },
      },
      include: {
        expenseTemplate: true,
        additionalIncome: {
          where: { isActive: true },
        },
        tenants: {
          where: { isActive: true },
        },
        leases: {
          where: { isActive: true },
        },
      },
    });

    return properties.map((p) => {
      const monthlyIncome =
        p.additionalIncome?.reduce((inc, i) => {
          let monthly = i.amount;
          if (i.frequency === 'QUARTERLY') monthly = i.amount / 3;
          if (i.frequency === 'ANNUALLY') monthly = i.amount / 12;
          if (i.frequency === 'ONE_TIME') monthly = 0;
          return inc + monthly;
        }, 0) || 0;

      const template = p.expenseTemplate;
      const monthlyExpenses = template
        ? (template.propertyManagementFee || 0) +
          (template.accountingLegalFees || 0) +
          (template.repairsMaintenance || 0) +
          (template.pestControl || 0) +
          (template.realEstateTaxes || 0) +
          (template.propertyInsurance || 0) +
          (template.hoaFees || 0) +
          (template.waterSewer || 0) +
          (template.gasElectricity || 0) +
          (template.garbage || 0) +
          (template.cablePhoneInternet || 0) +
          (template.advertising || 0) +
          (p.monthlyMortgagePayment || 0)
        : p.monthlyMortgagePayment || 0;

      const annualIncome = monthlyIncome * 12;
      const annualExpenses = monthlyExpenses * 12;
      const noi = annualIncome - annualExpenses;
      const capRate = p.currentValue > 0 ? (noi / p.currentValue) * 100 : 0;

      const totalInvested =
        p.purchasePrice +
        (p.refurbishCosts || 0) +
        (p.furnishCosts || 0) +
        (p.acquisitionCosts || 0);
      const cashOnCashReturn =
        totalInvested > 0
          ? ((monthlyIncome - monthlyExpenses) * 12 / totalInvested) * 100
          : 0;

      return {
        id: p.id,
        address: p.address,
        city: p.city,
        state: p.state,
        propertyType: p.propertyType,
        currentValue: p.currentValue,
        purchasePrice: p.purchasePrice,
        equity: p.currentValue - p.loanBalance,
        loanBalance: p.loanBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlyCashFlow: monthlyIncome - monthlyExpenses,
        capRate,
        cashOnCashReturn,
        hasActiveTenant: p.tenants && p.tenants.length > 0,
        hasActiveLease: p.leases && p.leases.length > 0,
      };
    });
  }

  /**
   * Get cash flow projection for a property
   */
  static async getCashFlowProjection(
    propertyId: string,
    months: number = 12
  ): Promise<any> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        expenseTemplate: true,
        additionalIncome: {
          where: { isActive: true },
        },
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const monthlyIncome =
      property.additionalIncome?.reduce((inc, i) => {
        let monthly = i.amount;
        if (i.frequency === 'QUARTERLY') monthly = i.amount / 3;
        if (i.frequency === 'ANNUALLY') monthly = i.amount / 12;
        if (i.frequency === 'ONE_TIME') monthly = 0;
        return inc + monthly;
      }, 0) || 0;

    const template = property.expenseTemplate;
    const monthlyExpenses = template
      ? (template.propertyManagementFee || 0) +
        (template.accountingLegalFees || 0) +
        (template.repairsMaintenance || 0) +
        (template.pestControl || 0) +
        (template.realEstateTaxes || 0) +
        (template.propertyInsurance || 0) +
        (template.hoaFees || 0) +
        (template.waterSewer || 0) +
        (template.gasElectricity || 0) +
        (template.garbage || 0) +
        (template.cablePhoneInternet || 0) +
        (template.advertising || 0) +
        (property.monthlyMortgagePayment || 0)
      : property.monthlyMortgagePayment || 0;

    const projections = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const projectionDate = new Date(today);
      projectionDate.setMonth(today.getMonth() + i);

      projections.push({
        month: projectionDate.toISOString().substring(0, 7),
        income: monthlyIncome,
        expenses: monthlyExpenses,
        cashFlow: monthlyIncome - monthlyExpenses,
      });
    }

    return {
      propertyId,
      address: property.address,
      projections,
    };
  }

  /**
   * Get occupancy rate for a user's portfolio
   */
  static async getOccupancyRate(userId: string): Promise<{
    totalProperties: number;
    occupiedProperties: number;
    vacantProperties: number;
    occupancyRate: number;
  }> {
    const properties = await prisma.property.findMany({
      where: { userId },
      include: {
        tenants: {
          where: { isActive: true },
        },
      },
    });

    const occupiedProperties = properties.filter(
      (p) => p.tenants && p.tenants.length > 0
    ).length;

    const vacantProperties = properties.length - occupiedProperties;
    const occupancyRate =
      properties.length > 0
        ? (occupiedProperties / properties.length) * 100
        : 0;

    return {
      totalProperties: properties.length,
      occupiedProperties,
      vacantProperties,
      occupancyRate,
    };
  }

  /**
   * Get maintenance costs for a property within a date range
   */
  static async getMaintenanceCosts(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalCost: number;
    completedRequests: number;
    averageCost: number;
    costByCategory: Record<string, number>;
  }> {
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        propertyId,
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
    });

    const totalCost = maintenanceRequests.reduce(
      (sum, r) => sum + (r.actualCost || 0),
      0
    );

    const costByCategory = maintenanceRequests.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + (r.actualCost || 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCost,
      completedRequests: maintenanceRequests.length,
      averageCost:
        maintenanceRequests.length > 0
          ? totalCost / maintenanceRequests.length
          : 0,
      costByCategory,
    };
  }

  /**
   * Get ROI trends for a property over time
   */
  static async getROITrends(
    propertyId: string,
    months: number = 12
  ): Promise<any> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        expenseTemplate: true,
        additionalIncome: {
          where: { isActive: true },
        },
      },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const monthlyIncome =
      property.additionalIncome?.reduce((inc, i) => {
        let monthly = i.amount;
        if (i.frequency === 'QUARTERLY') monthly = i.amount / 3;
        if (i.frequency === 'ANNUALLY') monthly = i.amount / 12;
        if (i.frequency === 'ONE_TIME') monthly = 0;
        return inc + monthly;
      }, 0) || 0;

    const template = property.expenseTemplate;
    const monthlyExpenses = template
      ? (template.propertyManagementFee || 0) +
        (template.accountingLegalFees || 0) +
        (template.repairsMaintenance || 0) +
        (template.pestControl || 0) +
        (template.realEstateTaxes || 0) +
        (template.propertyInsurance || 0) +
        (template.hoaFees || 0) +
        (template.waterSewer || 0) +
        (template.gasElectricity || 0) +
        (template.garbage || 0) +
        (template.cablePhoneInternet || 0) +
        (template.advertising || 0) +
        (property.monthlyMortgagePayment || 0)
      : property.monthlyMortgagePayment || 0;

    const totalInvested =
      property.purchasePrice +
      (property.refurbishCosts || 0) +
      (property.furnishCosts || 0) +
      (property.acquisitionCosts || 0);

    const monthlyCashFlow = monthlyIncome - monthlyExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCashReturn =
      totalInvested > 0 ? (annualCashFlow / totalInvested) * 100 : 0;

    // For historical trends, we'd need actual historical data
    // For now, we'll return current metrics
    const trends = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const trendDate = new Date(today);
      trendDate.setMonth(today.getMonth() - (months - i - 1));

      trends.push({
        month: trendDate.toISOString().substring(0, 7),
        cashOnCashReturn,
        monthlyCashFlow,
      });
    }

    return {
      propertyId,
      address: property.address,
      currentROI: cashOnCashReturn,
      trends,
    };
  }

  /**
   * Get expense breakdown for a property for a specific year
   */
  static async getExpenseBreakdown(
    propertyId: string,
    year: number
  ): Promise<{
    year: number;
    totalExpenses: number;
    breakdown: Record<string, number>;
  }> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        expenseTemplate: true,
      },
    });

    if (!property || !property.expenseTemplate) {
      return {
        year,
        totalExpenses: 0,
        breakdown: {},
      };
    }

    const template = property.expenseTemplate;
    const breakdown = {
      'Property Management': (template.propertyManagementFee || 0) * 12,
      'Accounting & Legal': (template.accountingLegalFees || 0) * 12,
      'Repairs & Maintenance': (template.repairsMaintenance || 0) * 12,
      'Pest Control': (template.pestControl || 0) * 12,
      'Real Estate Taxes': (template.realEstateTaxes || 0) * 12,
      'Property Insurance': (template.propertyInsurance || 0) * 12,
      'HOA Fees': (template.hoaFees || 0) * 12,
      'Water & Sewer': (template.waterSewer || 0) * 12,
      'Gas & Electricity': (template.gasElectricity || 0) * 12,
      Garbage: (template.garbage || 0) * 12,
      'Cable/Phone/Internet': (template.cablePhoneInternet || 0) * 12,
      Advertising: (template.advertising || 0) * 12,
      'Mortgage Payment': (property.monthlyMortgagePayment || 0) * 12,
    };

    const totalExpenses = Object.values(breakdown).reduce(
      (sum, val) => sum + val,
      0
    );

    return {
      year,
      totalExpenses,
      breakdown,
    };
  }
}
