import {
  PrismaClient,
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
  MaintenanceCategory,
} from '@prisma/client';

const prisma = new PrismaClient();

export class MaintenanceService {
  /**
   * Create a new maintenance request
   */
  static async createMaintenanceRequest(data: {
    propertyId: string;
    title: string;
    description: string;
    category: MaintenanceCategory;
    priority?: MaintenancePriority;
    scheduledDate?: Date;
    assignedTo?: string;
    estimatedCost?: number;
    images?: any;
    notes?: string;
  }): Promise<MaintenanceRequest> {
    return await prisma.maintenanceRequest.create({
      data: {
        ...data,
        status: MaintenanceStatus.PENDING,
        reportedDate: new Date(),
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
      },
    });
  }

  /**
   * Get maintenance request by ID
   */
  static async getMaintenanceById(
    requestId: string
  ): Promise<MaintenanceRequest | null> {
    return await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
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
    });
  }

  /**
   * Get all maintenance requests for a property
   */
  static async getMaintenanceByProperty(
    propertyId: string
  ): Promise<MaintenanceRequest[]> {
    return await prisma.maintenanceRequest.findMany({
      where: { propertyId },
      orderBy: [{ priority: 'desc' }, { reportedDate: 'desc' }],
    });
  }

  /**
   * Get all maintenance requests (with optional filters)
   */
  static async getAllMaintenance(filters?: {
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    category?: MaintenanceCategory;
    propertyId?: string;
  }): Promise<MaintenanceRequest[]> {
    return await prisma.maintenanceRequest.findMany({
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
      },
      orderBy: [{ priority: 'desc' }, { reportedDate: 'desc' }],
    });
  }

  /**
   * Update maintenance request
   */
  static async updateMaintenanceRequest(
    requestId: string,
    data: Partial<{
      title: string;
      description: string;
      category: MaintenanceCategory;
      priority: MaintenancePriority;
      status: MaintenanceStatus;
      scheduledDate: Date;
      completedDate: Date;
      assignedTo: string;
      estimatedCost: number;
      actualCost: number;
      images: any;
      notes: string;
    }>
  ): Promise<MaintenanceRequest> {
    return await prisma.maintenanceRequest.update({
      where: { id: requestId },
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
      },
    });
  }

  /**
   * Schedule maintenance request
   */
  static async scheduleMaintenanceRequest(
    requestId: string,
    scheduledDate: Date,
    assignedTo?: string
  ): Promise<MaintenanceRequest> {
    return await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: MaintenanceStatus.SCHEDULED,
        scheduledDate,
        ...(assignedTo && { assignedTo }),
      },
      include: {
        property: true,
      },
    });
  }

  /**
   * Mark maintenance as in progress
   */
  static async startMaintenance(
    requestId: string
  ): Promise<MaintenanceRequest> {
    return await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: MaintenanceStatus.IN_PROGRESS,
      },
      include: {
        property: true,
      },
    });
  }

  /**
   * Complete maintenance request
   */
  static async completeMaintenanceRequest(
    requestId: string,
    actualCost: number,
    notes?: string
  ): Promise<MaintenanceRequest> {
    return await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: MaintenanceStatus.COMPLETED,
        completedDate: new Date(),
        actualCost,
        ...(notes && { notes }),
      },
      include: {
        property: true,
      },
    });
  }

  /**
   * Cancel maintenance request
   */
  static async cancelMaintenanceRequest(
    requestId: string,
    reason?: string
  ): Promise<MaintenanceRequest> {
    return await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status: MaintenanceStatus.CANCELLED,
        notes: reason,
      },
      include: {
        property: true,
      },
    });
  }

  /**
   * Delete maintenance request
   */
  static async deleteMaintenanceRequest(requestId: string): Promise<void> {
    await prisma.maintenanceRequest.delete({
      where: { id: requestId },
    });
  }

  /**
   * Get upcoming maintenance (scheduled within next N days)
   */
  static async getUpcomingMaintenance(
    days: number = 7
  ): Promise<MaintenanceRequest[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await prisma.maintenanceRequest.findMany({
      where: {
        status: MaintenanceStatus.SCHEDULED,
        scheduledDate: {
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
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Get maintenance history for a property
   */
  static async getMaintenanceHistory(
    propertyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<MaintenanceRequest[]> {
    const where: any = {
      propertyId,
      status: MaintenanceStatus.COMPLETED,
    };

    if (startDate || endDate) {
      where.completedDate = {};
      if (startDate) where.completedDate.gte = startDate;
      if (endDate) where.completedDate.lte = endDate;
    }

    return await prisma.maintenanceRequest.findMany({
      where,
      orderBy: { completedDate: 'desc' },
    });
  }

  /**
   * Get maintenance statistics for a property
   */
  static async getMaintenanceStatistics(
    propertyId: string,
    year?: number
  ): Promise<{
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    totalCost: number;
    averageCost: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        propertyId,
        reportedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const completedRequests = requests.filter(
      (r) => r.status === MaintenanceStatus.COMPLETED
    );

    const totalCost = completedRequests.reduce(
      (sum, r) => sum + (r.actualCost || 0),
      0
    );

    // Group by category
    const byCategory = requests.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by priority
    const byPriority = requests.reduce((acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRequests: requests.length,
      completedRequests: completedRequests.length,
      pendingRequests: requests.filter(
        (r) =>
          r.status === MaintenanceStatus.PENDING ||
          r.status === MaintenanceStatus.SCHEDULED
      ).length,
      totalCost,
      averageCost:
        completedRequests.length > 0
          ? totalCost / completedRequests.length
          : 0,
      byCategory,
      byPriority,
    };
  }

  /**
   * Get emergency maintenance requests
   */
  static async getEmergencyMaintenance(): Promise<MaintenanceRequest[]> {
    return await prisma.maintenanceRequest.findMany({
      where: {
        priority: MaintenancePriority.EMERGENCY,
        status: {
          in: [
            MaintenanceStatus.PENDING,
            MaintenanceStatus.SCHEDULED,
            MaintenanceStatus.IN_PROGRESS,
          ],
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
      },
      orderBy: { reportedDate: 'asc' },
    });
  }
}
