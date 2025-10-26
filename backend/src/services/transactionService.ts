import { PrismaClient, Transaction, TransactionType } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  positionId: z.string().uuid().optional(),
  transactionType: z.nativeEnum(TransactionType),
  transactionDate: z.string().datetime(),
  settlementDate: z.string().datetime().optional(),
  shares: z.number().optional(),
  pricePerShare: z.number().optional(),
  totalAmount: z.number(),
  fees: z.number().default(0),
  description: z.string().optional(),
});

export const updateTransactionSchema = z.object({
  transactionType: z.nativeEnum(TransactionType).optional(),
  transactionDate: z.string().datetime().optional(),
  settlementDate: z.string().datetime().optional(),
  shares: z.number().optional(),
  pricePerShare: z.number().optional(),
  totalAmount: z.number().optional(),
  fees: z.number().optional(),
  description: z.string().optional(),
  isReconciled: z.boolean().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export class TransactionService {
  /**
   * Get all transactions for a user
   */
  static async getTransactions(userId: string): Promise<Transaction[]> {
    return await prisma.transaction.findMany({
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
    });
  }

  /**
   * Get transactions for a specific account
   */
  static async getTransactionsByAccount(
    userId: string,
    accountId: string
  ): Promise<Transaction[]> {
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found or access denied');
    }

    return await prisma.transaction.findMany({
      where: { accountId },
      include: {
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
    });
  }

  /**
   * Get transactions for a specific position
   */
  static async getTransactionsByPosition(
    userId: string,
    positionId: string
  ): Promise<Transaction[]> {
    // Verify position belongs to user
    const position = await prisma.position.findFirst({
      where: {
        id: positionId,
        account: {
          userId,
        },
      },
    });

    if (!position) {
      throw new Error('Position not found or access denied');
    }

    return await prisma.transaction.findMany({
      where: { positionId },
      include: {
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
  }

  /**
   * Get a single transaction
   */
  static async getTransaction(userId: string, id: string): Promise<Transaction> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
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
    });

    if (!transaction) {
      throw new Error('Transaction not found or access denied');
    }

    return transaction;
  }

  /**
   * Create a new transaction and update position if applicable
   */
  static async createTransaction(
    userId: string,
    input: CreateTransactionInput
  ): Promise<Transaction> {
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: input.accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found or access denied');
    }

    // If position is specified, verify it belongs to user
    if (input.positionId) {
      const position = await prisma.position.findFirst({
        where: {
          id: input.positionId,
          account: {
            userId,
          },
        },
      });

      if (!position) {
        throw new Error('Position not found or access denied');
      }
    }

    // Use a transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          accountId: input.accountId,
          positionId: input.positionId,
          transactionType: input.transactionType,
          transactionDate: new Date(input.transactionDate),
          settlementDate: input.settlementDate ? new Date(input.settlementDate) : null,
          shares: input.shares,
          pricePerShare: input.pricePerShare,
          totalAmount: input.totalAmount,
          fees: input.fees,
          description: input.description,
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
      });

      // Update position if this is a BUY or SELL transaction
      if (input.positionId && (input.transactionType === 'BUY' || input.transactionType === 'SELL')) {
        await this.recalculatePosition(tx, input.positionId);
      }

      return transaction;
    });
  }

  /**
   * Update an existing transaction
   */
  static async updateTransaction(
    userId: string,
    id: string,
    input: UpdateTransactionInput
  ): Promise<Transaction> {
    // Verify transaction belongs to user
    const existing = await prisma.transaction.findFirst({
      where: {
        id,
        account: {
          userId,
        },
      },
    });

    if (!existing) {
      throw new Error('Transaction not found or access denied');
    }

    // Use a transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.update({
        where: { id },
        data: {
          transactionType: input.transactionType,
          transactionDate: input.transactionDate ? new Date(input.transactionDate) : undefined,
          settlementDate: input.settlementDate ? new Date(input.settlementDate) : undefined,
          shares: input.shares,
          pricePerShare: input.pricePerShare,
          totalAmount: input.totalAmount,
          fees: input.fees,
          description: input.description,
          isReconciled: input.isReconciled,
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
      });

      // Recalculate position if this affects a position
      if (existing.positionId && (existing.transactionType === 'BUY' || existing.transactionType === 'SELL')) {
        await this.recalculatePosition(tx, existing.positionId);
      }

      return transaction;
    });
  }

  /**
   * Delete a transaction
   */
  static async deleteTransaction(userId: string, id: string): Promise<void> {
    // Verify transaction belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        account: {
          userId,
        },
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found or access denied');
    }

    await prisma.$transaction(async (tx) => {
      // Delete the transaction
      await tx.transaction.delete({
        where: { id },
      });

      // Recalculate position if this affected a position
      if (transaction.positionId && (transaction.transactionType === 'BUY' || transaction.transactionType === 'SELL')) {
        await this.recalculatePosition(tx, transaction.positionId);
      }
    });
  }

  /**
   * Recalculate position values based on all transactions
   */
  private static async recalculatePosition(tx: any, positionId: string): Promise<void> {
    // Get all BUY and SELL transactions for this position, ordered by date
    const transactions = await tx.transaction.findMany({
      where: {
        positionId,
        transactionType: {
          in: ['BUY', 'SELL'],
        },
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    let totalShares = 0;
    let totalCostBasis = 0;

    // Calculate weighted average cost basis
    for (const txn of transactions) {
      if (txn.transactionType === 'BUY') {
        const txnCost = (txn.shares || 0) * (txn.pricePerShare || 0) + txn.fees;
        totalCostBasis += txnCost;
        totalShares += txn.shares || 0;
      } else if (txn.transactionType === 'SELL') {
        // For sells, we reduce shares but maintain the weighted average cost basis per share
        const sharesToSell = txn.shares || 0;
        const costBasisPerShare = totalShares > 0 ? totalCostBasis / totalShares : 0;
        totalCostBasis -= sharesToSell * costBasisPerShare;
        totalShares -= sharesToSell;
      }
    }

    // Get the current position to keep the current price
    const position = await tx.position.findUnique({
      where: { id: positionId },
    });

    if (!position) {
      return;
    }

    // Calculate new values
    const costBasisPerShare = totalShares > 0 ? totalCostBasis / totalShares : 0;
    const currentValue = totalShares * position.currentPrice;
    const unrealizedGainLoss = currentValue - totalCostBasis;

    // Update the position
    await tx.position.update({
      where: { id: positionId },
      data: {
        shares: totalShares,
        costBasisTotal: totalCostBasis,
        costBasisPerShare,
        currentValue,
        unrealizedGainLoss,
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId,
        },
      },
    });

    const totalTransactions = transactions.length;
    const totalInflows = transactions
      .filter((t) => ['BUY', 'CONTRIBUTION', 'DIVIDEND', 'INCOME'].includes(t.transactionType))
      .reduce((sum, t) => sum + t.totalAmount, 0);
    const totalOutflows = transactions
      .filter((t) => ['SELL', 'WITHDRAWAL', 'EXPENSE'].includes(t.transactionType))
      .reduce((sum, t) => sum + t.totalAmount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0);

    const byType = transactions.reduce((acc, t) => {
      acc[t.transactionType] = (acc[t.transactionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTransactions,
      totalInflows,
      totalOutflows,
      netFlow: totalInflows - totalOutflows,
      totalFees,
      byType,
    };
  }
}
