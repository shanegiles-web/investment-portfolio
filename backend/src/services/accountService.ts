import { PrismaClient, type Account } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAccountInput {
  accountType: string;
  accountName: string;
  institution?: string;
  accountNumber?: string;
  taxTreatment: 'TAXABLE' | 'TAX_DEFERRED' | 'TAX_EXEMPT';
  owner?: string;
  beneficiaries?: Record<string, any>;
}

export interface UpdateAccountInput {
  accountType?: string;
  accountName?: string;
  institution?: string;
  accountNumber?: string;
  taxTreatment?: 'TAXABLE' | 'TAX_DEFERRED' | 'TAX_EXEMPT';
  owner?: string;
  beneficiaries?: Record<string, any>;
  isActive?: boolean;
}

export class AccountService {
  /**
   * Get all accounts for a user
   */
  static async getAccounts(userId: string): Promise<Account[]> {
    return await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        positions: {
          select: {
            id: true,
            name: true,
            currentValue: true,
          },
        },
      },
    });
  }

  /**
   * Get a single account by ID
   */
  static async getAccountById(accountId: string, userId: string): Promise<Account | null> {
    return await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
      },
      include: {
        positions: {
          include: {
            investmentType: true,
          },
        },
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 10,
        },
      },
    });
  }

  /**
   * Create a new account
   */
  static async createAccount(userId: string, input: CreateAccountInput): Promise<Account> {
    return await prisma.account.create({
      data: {
        userId,
        accountType: input.accountType,
        accountName: input.accountName,
        institution: input.institution,
        accountNumber: input.accountNumber,
        taxTreatment: input.taxTreatment,
        owner: input.owner,
        beneficiaries: input.beneficiaries || null,
      },
    });
  }

  /**
   * Update an account
   */
  static async updateAccount(
    accountId: string,
    userId: string,
    input: UpdateAccountInput
  ): Promise<Account> {
    // Verify ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found or unauthorized');
    }

    return await prisma.account.update({
      where: { id: accountId },
      data: input,
    });
  }

  /**
   * Delete an account (soft delete by setting isActive = false)
   */
  static async deleteAccount(accountId: string, userId: string): Promise<Account> {
    // Verify ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('Account not found or unauthorized');
    }

    // Soft delete
    return await prisma.account.update({
      where: { id: accountId },
      data: { isActive: false },
    });
  }

  /**
   * Get account statistics
   */
  static async getAccountStats(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId, isActive: true },
      include: {
        positions: {
          select: {
            currentValue: true,
          },
        },
      },
    });

    const totalValue = accounts.reduce((sum, account) => {
      const accountValue = account.positions.reduce(
        (posSum, pos) => posSum + pos.currentValue,
        0
      );
      return sum + accountValue;
    }, 0);

    const accountsByType = accounts.reduce((acc, account) => {
      acc[account.accountType] = (acc[account.accountType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAccounts: accounts.length,
      totalValue,
      accountsByType,
    };
  }
}
