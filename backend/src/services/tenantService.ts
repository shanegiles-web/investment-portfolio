import { PrismaClient, Tenant } from '@prisma/client';

const prisma = new PrismaClient();

export class TenantService {
  /**
   * Create a new tenant
   */
  static async createTenant(data: {
    propertyId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    moveInDate: Date;
    moveOutDate?: Date;
    notes?: string;
  }): Promise<Tenant> {
    console.log('🟣 [TenantService] createTenant called');
    console.log('📝 Input data:', data);

    try {
      console.log('⏳ [TenantService] Calling prisma.tenant.create...');

      const tenant = await prisma.tenant.create({
        data: {
          ...data,
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
          leases: true,
        },
      });

      console.log('✅ [TenantService] Tenant created in database:', tenant.id);
      console.log('📤 [TenantService] Returning tenant object');

      return tenant;
    } catch (error: any) {
      console.error('❌ [TenantService] Prisma error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
      });
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  static async getTenantById(tenantId: string): Promise<Tenant | null> {
    return await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            state: true,
          },
        },
        leases: {
          orderBy: { startDate: 'desc' },
        },
      },
    });
  }

  /**
   * Get all tenants for a property
   */
  static async getTenantsByProperty(propertyId: string): Promise<Tenant[]> {
    return await prisma.tenant.findMany({
      where: { propertyId },
      include: {
        leases: {
          orderBy: { startDate: 'desc' },
        },
      },
      orderBy: { moveInDate: 'desc' },
    });
  }

  /**
   * Get all active tenants for a property
   */
  static async getActiveTenantsByProperty(propertyId: string): Promise<Tenant[]> {
    return await prisma.tenant.findMany({
      where: {
        propertyId,
        isActive: true,
        moveOutDate: null,
      },
      include: {
        leases: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
      },
      orderBy: { moveInDate: 'desc' },
    });
  }

  /**
   * Get all tenants (with optional filters)
   */
  static async getAllTenants(filters?: {
    isActive?: boolean;
    propertyId?: string;
  }): Promise<Tenant[]> {
    return await prisma.tenant.findMany({
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
        leases: {
          orderBy: { startDate: 'desc' },
          take: 1, // Only get most recent lease
        },
      },
      orderBy: { moveInDate: 'desc' },
    });
  }

  /**
   * Update tenant
   */
  static async updateTenant(
    tenantId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      emergencyContact: string;
      emergencyPhone: string;
      moveInDate: Date;
      moveOutDate: Date;
      isActive: boolean;
      notes: string;
    }>
  ): Promise<Tenant> {
    return await prisma.tenant.update({
      where: { id: tenantId },
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
        leases: true,
      },
    });
  }

  /**
   * Mark tenant as moved out
   */
  static async markTenantMovedOut(
    tenantId: string,
    moveOutDate: Date
  ): Promise<Tenant> {
    return await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        moveOutDate,
        isActive: false,
      },
      include: {
        property: true,
        leases: true,
      },
    });
  }

  /**
   * Delete tenant
   */
  static async deleteTenant(tenantId: string): Promise<void> {
    await prisma.tenant.delete({
      where: { id: tenantId },
    });
  }

  /**
   * Get tenant history (previous tenants for a property)
   */
  static async getTenantHistory(propertyId: string): Promise<Tenant[]> {
    return await prisma.tenant.findMany({
      where: {
        propertyId,
        isActive: false,
        moveOutDate: { not: null },
      },
      include: {
        leases: true,
      },
      orderBy: { moveOutDate: 'desc' },
    });
  }

  /**
   * Search tenants by name
   */
  static async searchTenants(searchTerm: string): Promise<Tenant[]> {
    return await prisma.tenant.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm } },
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
        leases: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }
}
