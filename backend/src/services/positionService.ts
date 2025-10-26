import { PrismaClient, type Position } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePositionInput {
  accountId: string;
  investmentTypeId: string;
  symbol?: string;
  name: string;
  shares: number;
  costBasisTotal: number;
  currentPrice: number;
}

export interface UpdatePositionInput {
  symbol?: string;
  name?: string;
  shares?: number;
  costBasisTotal?: number;
  currentPrice?: number;
}

export class PositionService {
  /**
   * Get all positions for a user
   */
  static async getPositions(userId: string): Promise<Position[]> {
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = accounts.map((a) => a.id);

    return await prisma.position.findMany({
      where: { accountId: { in: accountIds } },
      include: {
        account: {
          select: {
            id: true,
            accountName: true,
            accountType: true,
          },
        },
        investmentType: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });
  }

  /**
   * Get positions for a specific account
   */
  static async getPositionsByAccount(accountId: string, userId: string): Promise<Position[]> {
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found or unauthorized');
    }

    return await prisma.position.findMany({
      where: { accountId },
      include: {
        investmentType: true,
      },
      orderBy: { lastUpdated: 'desc' },
    });
  }

  /**
   * Get a single position by ID
   */
  static async getPositionById(positionId: string, userId: string): Promise<Position | null> {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: {
        account: true,
        investmentType: true,
        taxLots: true,
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 20,
        },
      },
    });

    if (!position) {
      return null;
    }

    // Verify the position's account belongs to the user
    if (position.account.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return position;
  }

  /**
   * Create a new position
   */
  static async createPosition(userId: string, input: CreatePositionInput): Promise<Position> {
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: input.accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found or unauthorized');
    }

    // Calculate values
    const costBasisPerShare = input.shares > 0 ? input.costBasisTotal / input.shares : 0;
    const currentValue = input.shares * input.currentPrice;
    const unrealizedGainLoss = currentValue - input.costBasisTotal;

    return await prisma.position.create({
      data: {
        accountId: input.accountId,
        investmentTypeId: input.investmentTypeId,
        symbol: input.symbol,
        name: input.name,
        shares: input.shares,
        costBasisTotal: input.costBasisTotal,
        costBasisPerShare,
        currentPrice: input.currentPrice,
        currentValue,
        unrealizedGainLoss,
      },
      include: {
        account: true,
        investmentType: true,
      },
    });
  }

  /**
   * Update a position
   */
  static async updatePosition(
    positionId: string,
    userId: string,
    input: UpdatePositionInput
  ): Promise<Position> {
    // Get existing position and verify ownership
    const existingPosition = await this.getPositionById(positionId, userId);

    if (!existingPosition) {
      throw new Error('Position not found or unauthorized');
    }

    // Prepare update data
    const updateData: any = { ...input };

    // Recalculate values if shares or cost basis changed
    const shares = input.shares ?? existingPosition.shares;
    const costBasisTotal = input.costBasisTotal ?? existingPosition.costBasisTotal;
    const currentPrice = input.currentPrice ?? existingPosition.currentPrice;

    updateData.costBasisPerShare = shares > 0 ? costBasisTotal / shares : 0;
    updateData.currentValue = shares * currentPrice;
    updateData.unrealizedGainLoss = updateData.currentValue - costBasisTotal;
    updateData.lastUpdated = new Date();

    return await prisma.position.update({
      where: { id: positionId },
      data: updateData,
      include: {
        account: true,
        investmentType: true,
      },
    });
  }

  /**
   * Delete a position
   */
  static async deletePosition(positionId: string, userId: string): Promise<Position> {
    // Verify ownership
    const position = await this.getPositionById(positionId, userId);

    if (!position) {
      throw new Error('Position not found or unauthorized');
    }

    return await prisma.position.delete({
      where: { id: positionId },
    });
  }

  /**
   * Update position price (for bulk price updates)
   */
  static async updatePositionPrice(
    positionId: string,
    userId: string,
    newPrice: number
  ): Promise<Position> {
    const position = await this.getPositionById(positionId, userId);

    if (!position) {
      throw new Error('Position not found or unauthorized');
    }

    const currentValue = position.shares * newPrice;
    const unrealizedGainLoss = currentValue - position.costBasisTotal;

    return await prisma.position.update({
      where: { id: positionId },
      data: {
        currentPrice: newPrice,
        currentValue,
        unrealizedGainLoss,
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Get portfolio statistics
   */
  static async getPortfolioStats(userId: string) {
    const positions = await this.getPositions(userId);

    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasisTotal, 0);
    const totalGainLoss = totalValue - totalCostBasis;
    const percentGainLoss = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

    // Group by investment category
    const byCategory: Record<string, { value: number; count: number }> = {};
    positions.forEach((p) => {
      const category = p.investmentType.category;
      if (!byCategory[category]) {
        byCategory[category] = { value: 0, count: 0 };
      }
      byCategory[category].value += p.currentValue;
      byCategory[category].count += 1;
    });

    return {
      totalPositions: positions.length,
      totalValue,
      totalCostBasis,
      totalGainLoss,
      percentGainLoss,
      byCategory,
    };
  }
}
