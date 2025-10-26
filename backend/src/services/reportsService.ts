import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, format, differenceInDays } from 'date-fns';

const prisma = new PrismaClient();

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilters {
  accountId?: string;
  positionId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class ReportsService {
  /**
   * Get performance report with Time-Weighted Return (TWR)
   */
  static async getPerformanceReport(userId: string, filters: ReportFilters) {
    const { accountId, startDate, endDate } = filters;

    // Get positions with their transactions
    const positions = await prisma.position.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
      },
      include: {
        account: {
          select: {
            accountName: true,
            accountType: true,
          },
        },
        investmentType: {
          select: {
            name: true,
            category: true,
          },
        },
        transactions: {
          where: {
            ...(startDate && endDate && {
              transactionDate: {
                gte: startDate,
                lte: endDate,
              },
            }),
          },
          orderBy: {
            transactionDate: 'asc',
          },
        },
      },
    });

    // Calculate performance metrics for each position
    const positionPerformance = positions.map((position) => {
      const twr = this.calculateTimeWeightedReturn(position.transactions, position.currentValue);
      const totalReturn = position.currentValue - position.costBasisTotal + position.realizedGainLoss;
      const totalReturnPercent = position.costBasisTotal > 0 ? (totalReturn / position.costBasisTotal) * 100 : 0;

      return {
        positionId: position.id,
        symbol: position.symbol,
        name: position.name,
        accountName: position.account.accountName,
        category: position.investmentType.category,
        currentValue: position.currentValue,
        costBasis: position.costBasisTotal,
        unrealizedGainLoss: position.unrealizedGainLoss,
        realizedGainLoss: position.realizedGainLoss,
        totalReturn,
        totalReturnPercent,
        timeWeightedReturn: twr,
      };
    });

    // Calculate aggregate performance
    const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasisTotal, 0);
    const totalUnrealizedGainLoss = positions.reduce((sum, p) => sum + p.unrealizedGainLoss, 0);
    const totalRealizedGainLoss = positions.reduce((sum, p) => sum + p.realizedGainLoss, 0);
    const totalReturn = totalCurrentValue - totalCostBasis + totalRealizedGainLoss;
    const totalReturnPercent = totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0;

    // Calculate performance by time period
    const performanceByPeriod = await this.calculatePerformanceByPeriod(userId, accountId);

    return {
      summary: {
        totalCurrentValue,
        totalCostBasis,
        totalUnrealizedGainLoss,
        totalRealizedGainLoss,
        totalReturn,
        totalReturnPercent,
      },
      positions: positionPerformance,
      performanceByPeriod,
    };
  }

  /**
   * Calculate Time-Weighted Return (TWR)
   * TWR eliminates the effects of cash flows timing
   */
  private static calculateTimeWeightedReturn(transactions: any[], currentValue: number): number {
    if (transactions.length === 0) return 0;

    // Sort transactions by date
    const sortedTxns = [...transactions].sort((a, b) =>
      new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );

    let portfolioValue = 0;
    let cumulativeReturn = 1;

    sortedTxns.forEach((txn, index) => {
      const cashFlow = this.getCashFlowAmount(txn);

      if (index > 0) {
        // Calculate sub-period return
        const beginValue = portfolioValue;
        const endValue = portfolioValue + cashFlow;

        if (beginValue > 0) {
          const subReturn = endValue / beginValue;
          cumulativeReturn *= subReturn;
        }
      }

      portfolioValue += cashFlow;
    });

    // Final period return (to current value)
    if (portfolioValue > 0) {
      const finalReturn = currentValue / portfolioValue;
      cumulativeReturn *= finalReturn;
    }

    return (cumulativeReturn - 1) * 100;
  }

  /**
   * Get cash flow amount from transaction
   */
  private static getCashFlowAmount(transaction: any): number {
    switch (transaction.transactionType) {
      case 'BUY':
      case 'CONTRIBUTION':
        return transaction.totalAmount;
      case 'SELL':
      case 'WITHDRAWAL':
        return -transaction.totalAmount;
      case 'DIVIDEND':
      case 'INCOME':
      case 'DISTRIBUTION':
        return transaction.totalAmount;
      default:
        return 0;
    }
  }

  /**
   * Calculate performance by standard time periods
   */
  private static async calculatePerformanceByPeriod(userId: string, accountId?: string) {
    const now = new Date();

    const periods = [
      { label: '1M', startDate: subMonths(now, 1) },
      { label: '3M', startDate: subMonths(now, 3) },
      { label: '6M', startDate: subMonths(now, 6) },
      { label: '1Y', startDate: subYears(now, 1) },
      { label: 'YTD', startDate: startOfYear(now) },
    ];

    const results = await Promise.all(
      periods.map(async (period) => {
        const performance = await this.getPerformanceReport(userId, {
          accountId,
          startDate: period.startDate,
          endDate: now,
        });

        return {
          period: period.label,
          returnPercent: performance.summary.totalReturnPercent,
          gainLoss: performance.summary.totalReturn,
        };
      })
    );

    return results;
  }

  /**
   * Get asset allocation report
   */
  static async getAllocationReport(userId: string, accountId?: string, date?: Date) {
    const positions = await prisma.position.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
      },
      include: {
        account: {
          select: {
            accountName: true,
            accountType: true,
            taxTreatment: true,
          },
        },
        investmentType: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);

    // Allocation by category
    const byCategory = this.aggregateByField(positions, 'investmentType.category', totalValue);

    // Allocation by account type
    const byAccountType = this.aggregateByField(positions, 'account.accountType', totalValue);

    // Allocation by tax treatment
    const byTaxTreatment = this.aggregateByField(positions, 'account.taxTreatment', totalValue);

    return {
      totalValue,
      byCategory,
      byAccountType,
      byTaxTreatment,
    };
  }

  /**
   * Aggregate positions by a specific field
   */
  private static aggregateByField(positions: any[], fieldPath: string, totalValue: number) {
    const aggregated: Record<string, { name: string; value: number; percentage: number; count: number }> = {};

    positions.forEach((position) => {
      const fieldValue = this.getNestedField(position, fieldPath) || 'Other';

      if (!aggregated[fieldValue]) {
        aggregated[fieldValue] = {
          name: fieldValue,
          value: 0,
          percentage: 0,
          count: 0,
        };
      }

      aggregated[fieldValue].value += position.currentValue;
      aggregated[fieldValue].count += 1;
    });

    // Calculate percentages
    Object.values(aggregated).forEach((item) => {
      item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });

    return Object.values(aggregated).sort((a, b) => b.value - a.value);
  }

  /**
   * Get nested field value from object
   */
  private static getNestedField(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get income analysis report
   */
  static async getIncomeReport(userId: string, filters: ReportFilters) {
    const { accountId, startDate, endDate } = filters;

    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
        transactionType: {
          in: ['DIVIDEND', 'INCOME', 'DISTRIBUTION'],
        },
        ...(startDate && endDate && {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        position: {
          select: {
            symbol: true,
            name: true,
            currentValue: true,
            costBasisTotal: true,
          },
        },
        account: {
          select: {
            accountName: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    // Calculate income by position
    const incomeByPosition: Record<string, any> = {};
    transactions.forEach((txn) => {
      const key = txn.positionId || 'other';
      if (!incomeByPosition[key]) {
        incomeByPosition[key] = {
          positionId: txn.positionId,
          symbol: txn.position?.symbol || 'N/A',
          name: txn.position?.name || 'Other',
          totalIncome: 0,
          dividendCount: 0,
          currentValue: txn.position?.currentValue || 0,
          costBasis: txn.position?.costBasisTotal || 0,
          yieldOnCost: 0,
          currentYield: 0,
        };
      }
      incomeByPosition[key].totalIncome += txn.totalAmount;
      incomeByPosition[key].dividendCount += 1;
    });

    // Calculate yields (annualized)
    Object.values(incomeByPosition).forEach((item: any) => {
      if (item.costBasis > 0) {
        item.yieldOnCost = (item.totalIncome / item.costBasis) * 100;
      }
      if (item.currentValue > 0) {
        item.currentYield = (item.totalIncome / item.currentValue) * 100;
      }
    });

    // Income by month
    const incomeByMonth = this.aggregateIncomeByPeriod(transactions, 'month');

    // Income by quarter
    const incomeByQuarter = this.aggregateIncomeByPeriod(transactions, 'quarter');

    const totalIncome = transactions.reduce((sum, txn) => sum + txn.totalAmount, 0);

    return {
      summary: {
        totalIncome,
        transactionCount: transactions.length,
        averagePerTransaction: transactions.length > 0 ? totalIncome / transactions.length : 0,
      },
      byPosition: Object.values(incomeByPosition).sort((a: any, b: any) => b.totalIncome - a.totalIncome),
      byMonth: incomeByMonth,
      byQuarter: incomeByQuarter,
      transactions: transactions.slice(0, 50), // Latest 50 transactions
    };
  }

  /**
   * Aggregate income by time period
   */
  private static aggregateIncomeByPeriod(transactions: any[], periodType: 'month' | 'quarter') {
    const aggregated: Record<string, { period: string; income: number; count: number }> = {};

    transactions.forEach((txn) => {
      const date = new Date(txn.transactionDate);
      let key: string;
      let label: string;

      if (periodType === 'month') {
        key = format(date, 'yyyy-MM');
        label = format(date, 'MMM yyyy');
      } else {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        label = `Q${quarter} ${date.getFullYear()}`;
      }

      if (!aggregated[key]) {
        aggregated[key] = {
          period: label,
          income: 0,
          count: 0,
        };
      }

      aggregated[key].income += txn.totalAmount;
      aggregated[key].count += 1;
    });

    return Object.entries(aggregated)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data);
  }

  /**
   * Get portfolio activity summary
   */
  static async getActivityReport(userId: string, filters: ReportFilters) {
    const { accountId, startDate, endDate } = filters;

    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
        ...(startDate && endDate && {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        position: {
          select: {
            symbol: true,
            name: true,
          },
        },
        account: {
          select: {
            accountName: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    // Aggregate by transaction type
    const byType: Record<string, { type: string; count: number; totalAmount: number }> = {};
    let totalInflows = 0;
    let totalOutflows = 0;
    let totalFees = 0;

    transactions.forEach((txn) => {
      if (!byType[txn.transactionType]) {
        byType[txn.transactionType] = {
          type: txn.transactionType,
          count: 0,
          totalAmount: 0,
        };
      }
      byType[txn.transactionType].count += 1;
      byType[txn.transactionType].totalAmount += txn.totalAmount;

      // Track inflows/outflows
      if (['BUY', 'CONTRIBUTION', 'DIVIDEND', 'INCOME', 'DISTRIBUTION'].includes(txn.transactionType)) {
        totalInflows += txn.totalAmount;
      }
      if (['SELL', 'WITHDRAWAL', 'EXPENSE'].includes(txn.transactionType)) {
        totalOutflows += txn.totalAmount;
      }
      totalFees += txn.fees;
    });

    // Activity by month
    const byMonth = this.aggregateActivityByMonth(transactions);

    return {
      summary: {
        totalTransactions: transactions.length,
        totalInflows,
        totalOutflows,
        netFlow: totalInflows - totalOutflows,
        totalFees,
      },
      byType: Object.values(byType).sort((a, b) => b.totalAmount - a.totalAmount),
      byMonth,
      recentTransactions: transactions.slice(0, 50),
    };
  }

  /**
   * Aggregate activity by month
   */
  private static aggregateActivityByMonth(transactions: any[]) {
    const aggregated: Record<string, any> = {};

    transactions.forEach((txn) => {
      const key = format(new Date(txn.transactionDate), 'yyyy-MM');
      const label = format(new Date(txn.transactionDate), 'MMM yyyy');

      if (!aggregated[key]) {
        aggregated[key] = {
          period: label,
          count: 0,
          inflows: 0,
          outflows: 0,
          netFlow: 0,
        };
      }

      aggregated[key].count += 1;

      if (['BUY', 'CONTRIBUTION', 'DIVIDEND', 'INCOME', 'DISTRIBUTION'].includes(txn.transactionType)) {
        aggregated[key].inflows += txn.totalAmount;
      }
      if (['SELL', 'WITHDRAWAL', 'EXPENSE'].includes(txn.transactionType)) {
        aggregated[key].outflows += txn.totalAmount;
      }
      aggregated[key].netFlow = aggregated[key].inflows - aggregated[key].outflows;
    });

    return Object.entries(aggregated)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data);
  }

  /**
   * Get gain/loss report
   */
  static async getGainLossReport(userId: string, filters: ReportFilters & { type?: 'realized' | 'unrealized' | 'all' }) {
    const { accountId, startDate, endDate, type = 'all' } = filters;

    // Get positions for unrealized gains/losses
    const positions = await prisma.position.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
      },
      include: {
        account: {
          select: {
            accountName: true,
            accountType: true,
          },
        },
        investmentType: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    // Get sell transactions for realized gains/losses
    const sellTransactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
        transactionType: 'SELL',
        ...(startDate && endDate && {
          transactionDate: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        position: {
          select: {
            symbol: true,
            name: true,
          },
        },
        account: {
          select: {
            accountName: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    // Unrealized gains/losses
    const unrealizedGains = positions.map((position) => ({
      positionId: position.id,
      symbol: position.symbol,
      name: position.name,
      accountName: position.account.accountName,
      category: position.investmentType.category,
      currentValue: position.currentValue,
      costBasis: position.costBasisTotal,
      gainLoss: position.unrealizedGainLoss,
      gainLossPercent: position.costBasisTotal > 0 ? (position.unrealizedGainLoss / position.costBasisTotal) * 100 : 0,
      type: 'unrealized' as const,
    }));

    // Realized gains/losses from sells
    const realizedGains = sellTransactions.map((txn) => ({
      transactionId: txn.id,
      positionId: txn.positionId,
      symbol: txn.position?.symbol || 'N/A',
      name: txn.position?.name || 'N/A',
      accountName: txn.account.accountName,
      transactionDate: txn.transactionDate,
      quantity: txn.quantity,
      price: txn.price,
      totalAmount: txn.totalAmount,
      gainLoss: txn.realizedGainLoss,
      gainLossPercent: txn.costBasis > 0 ? (txn.realizedGainLoss / txn.costBasis) * 100 : 0,
      type: 'realized' as const,
    }));

    // Filter based on type
    let gains: any[] = [];
    if (type === 'unrealized' || type === 'all') {
      gains = [...gains, ...unrealizedGains];
    }
    if (type === 'realized' || type === 'all') {
      gains = [...gains, ...realizedGains];
    }

    const totalUnrealizedGainLoss = unrealizedGains.reduce((sum, g) => sum + g.gainLoss, 0);
    const totalRealizedGainLoss = realizedGains.reduce((sum, g) => sum + g.gainLoss, 0);

    return {
      summary: {
        totalUnrealizedGainLoss,
        totalRealizedGainLoss,
        totalGainLoss: totalUnrealizedGainLoss + totalRealizedGainLoss,
      },
      unrealizedGains: unrealizedGains.sort((a, b) => b.gainLoss - a.gainLoss),
      realizedGains: realizedGains.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()),
      allGains: gains,
    };
  }

  /**
   * Get holdings report
   */
  static async getHoldingsReport(userId: string, accountId?: string, date?: Date) {
    const positions = await prisma.position.findMany({
      where: {
        account: {
          userId,
          ...(accountId && { id: accountId }),
        },
      },
      include: {
        account: {
          select: {
            accountName: true,
            accountType: true,
            taxTreatment: true,
          },
        },
        investmentType: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        currentValue: 'desc',
      },
    });

    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasisTotal, 0);
    const totalGainLoss = positions.reduce((sum, p) => sum + p.unrealizedGainLoss, 0);

    const holdings = positions.map((position) => ({
      positionId: position.id,
      symbol: position.symbol,
      name: position.name,
      accountName: position.account.accountName,
      accountType: position.account.accountType,
      taxTreatment: position.account.taxTreatment,
      category: position.investmentType.category,
      quantity: position.quantity,
      currentPrice: position.currentPrice,
      currentValue: position.currentValue,
      costBasis: position.costBasisTotal,
      costBasisPerShare: position.costBasisPerShare,
      gainLoss: position.unrealizedGainLoss,
      gainLossPercent: position.costBasisTotal > 0 ? (position.unrealizedGainLoss / position.costBasisTotal) * 100 : 0,
      percentOfPortfolio: totalValue > 0 ? (position.currentValue / totalValue) * 100 : 0,
    }));

    return {
      summary: {
        totalHoldings: positions.length,
        totalValue,
        totalCostBasis,
        totalGainLoss,
        totalGainLossPercent: totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0,
      },
      holdings,
    };
  }
}
