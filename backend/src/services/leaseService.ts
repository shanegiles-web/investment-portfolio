import { PrismaClient, Lease, LeaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class LeaseService {
  /**
   * Create a new lease
   */
  static async createLease(data: {
    propertyId: string;
    tenantId?: string;
    tenantName: string;
    tenantContact?: string;
    startDate: Date;
    endDate: Date;
    monthlyRent: number;
    securityDeposit?: number;
    depositHeld?: number;
    leaseTermMonths?: number;
    renewalOption?: boolean;
    autoRenewal?: boolean;
    leaseDocumentUrl?: string;
    notes?: string;
  }): Promise<Lease> {
    return await prisma.lease.create({
      data: {
        ...data,
        status: LeaseStatus.ACTIVE,
        isActive: true,
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: true,
      },
    });
  }

  /**
   * Get lease by ID
   */
  static async getLeaseById(leaseId: string): Promise<Lease | null> {
    return await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: true,
      },
    });
  }

  /**
   * Get all leases for a property
   */
  static async getLeasesByProperty(propertyId: string): Promise<Lease[]> {
    return await prisma.lease.findMany({
      where: { propertyId },
      include: {
        tenant: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Get active leases for a property
   */
  static async getActiveLeasesByProperty(propertyId: string): Promise<Lease[]> {
    return await prisma.lease.findMany({
      where: {
        propertyId,
        status: LeaseStatus.ACTIVE,
        isActive: true,
      },
      include: {
        tenant: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Get all leases for a tenant
   */
  static async getLeasesByTenant(tenantId: string): Promise<Lease[]> {
    return await prisma.lease.findMany({
      where: { tenantId },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Get all leases (with optional filters)
   */
  static async getAllLeases(filters?: {
    status?: LeaseStatus;
    isActive?: boolean;
  }): Promise<Lease[]> {
    return await prisma.lease.findMany({
      where: filters,
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Update lease
   */
  static async updateLease(
    leaseId: string,
    data: Partial<{
      tenantName: string;
      tenantContact: string;
      startDate: Date;
      endDate: Date;
      monthlyRent: number;
      securityDeposit: number;
      depositHeld: number;
      leaseTermMonths: number;
      renewalOption: boolean;
      autoRenewal: boolean;
      status: LeaseStatus;
      isActive: boolean;
      leaseDocumentUrl: string;
      notes: string;
    }>
  ): Promise<Lease> {
    return await prisma.lease.update({
      where: { id: leaseId },
      data,
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: true,
      },
    });
  }

  /**
   * Terminate lease
   */
  static async terminateLease(
    leaseId: string,
    terminationDate: Date
  ): Promise<Lease> {
    return await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: LeaseStatus.TERMINATED,
        isActive: false,
        endDate: terminationDate,
      },
      include: {
        property: true,
        tenant: true,
      },
    });
  }

  /**
   * Renew lease
   */
  static async renewLease(
    leaseId: string,
    newEndDate: Date,
    newMonthlyRent?: number
  ): Promise<Lease> {
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new Error('Lease not found');
    }

    // Update the existing lease to mark it as expired
    await prisma.lease.update({
      where: { id: leaseId },
      data: {
        status: LeaseStatus.EXPIRED,
        isActive: false,
      },
    });

    // Create a new lease for the renewal
    return await prisma.lease.create({
      data: {
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        tenantName: lease.tenantName,
        tenantContact: lease.tenantContact,
        startDate: lease.endDate, // New lease starts when old one ends
        endDate: newEndDate,
        monthlyRent: newMonthlyRent || lease.monthlyRent,
        securityDeposit: lease.securityDeposit,
        depositHeld: lease.depositHeld,
        leaseTermMonths: lease.leaseTermMonths,
        renewalOption: lease.renewalOption,
        autoRenewal: lease.autoRenewal,
        status: LeaseStatus.ACTIVE,
        isActive: true,
        notes: `Renewed from lease ${leaseId}`,
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: true,
      },
    });
  }

  /**
   * Get expiring leases (within specified days)
   */
  static async getExpiringLeases(days: number = 30): Promise<Lease[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await prisma.lease.findMany({
      where: {
        status: LeaseStatus.ACTIVE,
        isActive: true,
        endDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: true,
      },
      orderBy: { endDate: 'asc' },
    });
  }

  /**
   * Get lease calendar (all lease dates within a date range)
   */
  static async getLeaseCalendar(
    startDate: Date,
    endDate: Date
  ): Promise<Lease[]> {
    return await prisma.lease.findMany({
      where: {
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        tenant: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Delete lease
   */
  static async deleteLease(leaseId: string): Promise<void> {
    await prisma.lease.delete({
      where: { id: leaseId },
    });
  }

  /**
   * Mark expired leases
   * Should be run periodically (e.g., daily cron job)
   */
  static async markExpiredLeases(): Promise<number> {
    const today = new Date();

    const result = await prisma.lease.updateMany({
      where: {
        status: LeaseStatus.ACTIVE,
        endDate: {
          lt: today,
        },
      },
      data: {
        status: LeaseStatus.EXPIRED,
        isActive: false,
      },
    });

    return result.count;
  }
}
