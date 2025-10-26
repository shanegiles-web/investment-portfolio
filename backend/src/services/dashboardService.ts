import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  /**
   * Get comprehensive dashboard data for a user
   */
  static async getDashboardData(userId: string) {
    // Fetch all necessary data in parallel
    const [
      accounts,
      positions,
      transactions,
      recentTransactions,
      properties,
    ] = await Promise.all([
      // Get accounts with their positions
      prisma.account.findMany({
        where: { userId, isActive: true },
        include: {
          positions: {
            include: {
              investmentType: true,
            },
          },
        },
      }),
      // Get all positions
      prisma.position.findMany({
        where: {
          account: {
            userId,
          },
        },
        include: {
          account: {
            select: {
              accountName: true,
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
      }),
      // Get all transactions for statistics
      prisma.transaction.findMany({
        where: {
          account: {
            userId,
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
      }),
      // Get recent transactions for activity feed
      prisma.transaction.findMany({
        where: {
          account: {
            userId,
          },
        },
        include: {
          account: {
            select: {
              accountName: true,
            },
          },
          position: {
            select: {
              name: true,
              symbol: true,
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        take: 10,
      }),
      // Get properties with account info, expenses, and income
      prisma.property.findMany({
        where: { userId },
        include: {
          account: {
            select: {
              accountName: true,
              taxTreatment: true,
            },
          },
          expenseTemplate: true,
          additionalIncome: {
            where: { isActive: true },
          },
        },
      }),
    ]);

    // Calculate real estate metrics
    const realEstateSummary = {
      propertyCount: properties.length,
      totalValue: properties.reduce((sum, p) => sum + p.currentValue, 0),
      totalEquity: properties.reduce((sum, p) => sum + (p.currentValue - p.loanBalance), 0),
      totalDebt: properties.reduce((sum, p) => sum + p.loanBalance, 0),
      monthlyIncome: properties.reduce((sum, p) => {
        const income = p.additionalIncome?.reduce((inc, i) => {
          // Convert to monthly based on frequency
          let monthlyAmount = i.amount;
          if (i.frequency === 'QUARTERLY') monthlyAmount = i.amount / 3;
          if (i.frequency === 'ANNUALLY') monthlyAmount = i.amount / 12;
          if (i.frequency === 'ONE_TIME') monthlyAmount = 0;
          return inc + monthlyAmount;
        }, 0) || 0;
        return sum + income;
      }, 0),
      monthlyExpenses: properties.reduce((sum, p) => {
        const template = p.expenseTemplate;
        if (!template) return sum;
        return sum + (
          (template.propertyManagementFee || 0) +
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
          (template.advertising || 0)
        );
      }, 0),
      monthlyCashFlow: 0, // Will be calculated below
    };
    realEstateSummary.monthlyCashFlow = realEstateSummary.monthlyIncome - realEstateSummary.monthlyExpenses;

    // Calculate portfolio totals (now including real estate equity)
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0) + realEstateSummary.totalEquity;
    const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasisTotal, 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const percentGainLoss = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

    // Calculate asset allocation by category
    const allocationByCategory = positions.reduce((acc, position) => {
      const category = position.investmentType.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          value: 0,
          percentage: 0,
          positionCount: 0,
        };
      }
      acc[category].value += position.currentValue;
      acc[category].positionCount += 1;
      return acc;
    }, {} as Record<string, { category: string; value: number; percentage: number; positionCount: number }>);

    // Add REAL_ESTATE to allocation by category
    if (realEstateSummary.totalEquity > 0) {
      allocationByCategory['REAL_ESTATE'] = {
        category: 'REAL_ESTATE',
        value: realEstateSummary.totalEquity,
        percentage: 0, // Will be calculated below
        positionCount: properties.length,
      };
    }

    // Calculate percentages
    Object.values(allocationByCategory).forEach((item) => {
      item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });

    // Group properties by account
    const propertyAccountMap = properties.reduce((acc, prop) => {
      if (!prop.accountId) return acc;
      const equity = prop.currentValue - prop.loanBalance;
      if (!acc[prop.accountId]) {
        acc[prop.accountId] = { equity: 0, propertyCount: 0 };
      }
      acc[prop.accountId].equity += equity;
      acc[prop.accountId].propertyCount += 1;
      return acc;
    }, {} as Record<string, { equity: number; propertyCount: number }>);

    // Calculate asset allocation by account (including property equity)
    const allocationByAccount = accounts.map((account) => {
      const accountValue = account.positions.reduce((sum, p) => sum + p.currentValue, 0);
      const accountCostBasis = account.positions.reduce((sum, p) => sum + p.costBasisTotal, 0);
      const propertyData = propertyAccountMap[account.id];
      const totalAccountValue = accountValue + (propertyData?.equity || 0);

      return {
        accountId: account.id,
        accountName: account.accountName,
        accountType: account.accountType,
        taxTreatment: account.taxTreatment,
        value: totalAccountValue,
        costBasis: accountCostBasis,
        gainLoss: accountValue - accountCostBasis,
        percentage: totalValue > 0 ? (totalAccountValue / totalValue) * 100 : 0,
        positionCount: account.positions.length,
        propertyCount: propertyData?.propertyCount || 0,
      };
    });

    // Calculate allocation by tax treatment
    const allocationByTax = allocationByAccount.reduce((acc, account) => {
      const treatment = account.taxTreatment;
      if (!acc[treatment]) {
        acc[treatment] = {
          taxTreatment: treatment,
          value: 0,
          percentage: 0,
          accountCount: 0,
        };
      }
      acc[treatment].value += account.value;
      acc[treatment].accountCount += 1;
      return acc;
    }, {} as Record<string, { taxTreatment: string; value: number; percentage: number; accountCount: number }>);

    // Calculate percentages
    Object.values(allocationByTax).forEach((item) => {
      item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    });

    // Calculate transaction statistics
    const transactionStats = transactions.reduce(
      (acc, txn) => {
        acc.totalCount += 1;
        if (['BUY', 'CONTRIBUTION', 'DIVIDEND', 'INCOME', 'DISTRIBUTION'].includes(txn.transactionType)) {
          acc.totalInflows += txn.totalAmount;
        }
        if (['SELL', 'WITHDRAWAL', 'EXPENSE'].includes(txn.transactionType)) {
          acc.totalOutflows += txn.totalAmount;
        }
        acc.totalFees += txn.fees;
        return acc;
      },
      {
        totalCount: 0,
        totalInflows: 0,
        totalOutflows: 0,
        totalFees: 0,
        netFlow: 0,
      }
    );
    transactionStats.netFlow = transactionStats.totalInflows - transactionStats.totalOutflows;

    // Top 5 positions by value
    const topPositions = positions
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        symbol: p.symbol,
        name: p.name,
        currentValue: p.currentValue,
        gainLoss: p.unrealizedGainLoss,
        percentGainLoss: p.costBasisTotal > 0 ? (p.unrealizedGainLoss / p.costBasisTotal) * 100 : 0,
        percentage: totalValue > 0 ? (p.currentValue / totalValue) * 100 : 0,
      }));

    // Top 5 performers by percentage gain
    const topPerformers = positions
      .filter((p) => p.costBasisTotal > 0)
      .map((p) => ({
        id: p.id,
        symbol: p.symbol,
        name: p.name,
        gainLoss: p.unrealizedGainLoss,
        percentGainLoss: (p.unrealizedGainLoss / p.costBasisTotal) * 100,
      }))
      .sort((a, b) => b.percentGainLoss - a.percentGainLoss)
      .slice(0, 5);

    // Bottom 5 performers by percentage loss
    const bottomPerformers = positions
      .filter((p) => p.costBasisTotal > 0)
      .map((p) => ({
        id: p.id,
        symbol: p.symbol,
        name: p.name,
        gainLoss: p.unrealizedGainLoss,
        percentGainLoss: (p.unrealizedGainLoss / p.costBasisTotal) * 100,
      }))
      .sort((a, b) => a.percentGainLoss - b.percentGainLoss)
      .slice(0, 5);

    // Calculate monthly transaction activity (last 12 months)
    const monthlyActivity = this.calculateMonthlyActivity(transactions);

    return {
      summary: {
        totalValue,
        totalCostBasis,
        totalGainLoss,
        percentGainLoss,
        positionCount: positions.length,
        accountCount: accounts.length,
        realEstate: realEstateSummary,
      },
      allocation: {
        byCategory: Object.values(allocationByCategory),
        byAccount: allocationByAccount,
        byTaxTreatment: Object.values(allocationByTax),
      },
      transactions: transactionStats,
      topPositions,
      topPerformers,
      bottomPerformers,
      recentActivity: recentTransactions,
      monthlyActivity,
    };
  }

  /**
   * Calculate monthly transaction activity for the last 12 months
   */
  private static calculateMonthlyActivity(transactions: any[]) {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Initialize 12 months
    const monthlyData: Record<string, { month: string; inflows: number; outflows: number; netFlow: number; count: number }> = {};
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        month: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        inflows: 0,
        outflows: 0,
        netFlow: 0,
        count: 0,
      };
    }

    // Aggregate transactions by month
    transactions.forEach((txn) => {
      const txnDate = new Date(txn.transactionDate);
      if (txnDate >= twelveMonthsAgo) {
        const key = `${txnDate.getFullYear()}-${String(txnDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          monthlyData[key].count += 1;
          if (['BUY', 'CONTRIBUTION', 'DIVIDEND', 'INCOME', 'DISTRIBUTION'].includes(txn.transactionType)) {
            monthlyData[key].inflows += txn.totalAmount;
          }
          if (['SELL', 'WITHDRAWAL', 'EXPENSE'].includes(txn.transactionType)) {
            monthlyData[key].outflows += txn.totalAmount;
          }
          monthlyData[key].netFlow = monthlyData[key].inflows - monthlyData[key].outflows;
        }
      }
    });

    // Convert to array and sort by date (oldest first)
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data);
  }

  /**
   * Get net worth history (simplified for now - could be expanded with historical tracking)
   */
  static async getNetWorthHistory(userId: string) {
    // For now, just return current net worth
    // In a real app, you'd store historical snapshots
    const positions = await prisma.position.findMany({
      where: {
        account: {
          userId,
        },
      },
    });

    const currentNetWorth = positions.reduce((sum, p) => sum + p.currentValue, 0);

    return {
      current: currentNetWorth,
      history: [
        {
          date: new Date().toISOString(),
          value: currentNetWorth,
        },
      ],
    };
  }
}
