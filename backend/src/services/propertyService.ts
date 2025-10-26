import { PrismaClient, Property, PropertyType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface CreatePropertyInput {
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string;
  zip: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;

  // Financial details
  refurbishCosts?: number;
  furnishCosts?: number;
  acquisitionCosts?: number;
  downPayment?: number;
  loanAmount?: number;
  loanInterestRate?: number;
  loanTermYears?: number;
  monthlyMortgagePayment?: number;
  propertyManagementFeePercent?: number;
  vacancyRatePercent?: number;
  desiredCapRate?: number;

  // Physical details
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  numberOfUnits?: number;

  // Optional
  entityId?: string;
  metadata?: any;
}

export interface UpdatePropertyInput {
  propertyType?: PropertyType;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  loanBalance?: number;

  refurbishCosts?: number;
  furnishCosts?: number;
  acquisitionCosts?: number;
  downPayment?: number;
  loanAmount?: number;
  loanInterestRate?: number;
  loanTermYears?: number;
  monthlyMortgagePayment?: number;
  propertyManagementFeePercent?: number;
  vacancyRatePercent?: number;
  desiredCapRate?: number;

  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  numberOfUnits?: number;

  entityId?: string;
  metadata?: any;
}

export class PropertyService {
  /**
   * Get all properties for a user
   */
  static async getProperties(userId: string): Promise<Property[]> {
    return await prisma.property.findMany({
      where: { userId },
      include: {
        entity: true,
        leases: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
        expenseTemplate: true,
        additionalIncome: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single property by ID
   */
  static async getPropertyById(propertyId: string, userId: string): Promise<Property | null> {
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        userId,
      },
      include: {
        entity: true,
        leases: {
          orderBy: { startDate: 'desc' },
        },
        propertyTransactions: {
          orderBy: { transactionDate: 'desc' },
          take: 50,
        },
        expenseTemplate: true,
        additionalIncome: true,
      },
    });

    return property;
  }

  /**
   * Create a new property
   */
  static async createProperty(userId: string, input: CreatePropertyInput): Promise<Property> {
    return await prisma.property.create({
      data: {
        userId,
        ...input,
        purchaseDate: new Date(input.purchaseDate),
        loanBalance: input.loanAmount || 0,
      },
      include: {
        entity: true,
        leases: true,
        expenseTemplate: true,
        additionalIncome: true,
      },
    });
  }

  /**
   * Update a property
   */
  static async updateProperty(
    propertyId: string,
    userId: string,
    input: UpdatePropertyInput
  ): Promise<Property> {
    // Verify ownership
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    return await prisma.property.update({
      where: { id: propertyId },
      data: {
        ...input,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : undefined,
      },
      include: {
        entity: true,
        leases: true,
        expenseTemplate: true,
        additionalIncome: true,
      },
    });
  }

  /**
   * Delete a property
   */
  static async deleteProperty(propertyId: string, userId: string): Promise<Property> {
    // Verify ownership
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    // Delete associated images from filesystem
    if (property.primaryImageUrl) {
      this.deleteImageFile(property.primaryImageUrl);
    }
    if (property.imageUrls && Array.isArray(property.imageUrls)) {
      property.imageUrls.forEach((url: string) => this.deleteImageFile(url));
    }

    return await prisma.property.delete({
      where: { id: propertyId },
    });
  }

  /**
   * Add images to a property
   */
  static async addImages(
    propertyId: string,
    userId: string,
    imageUrls: string[]
  ): Promise<Property> {
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    const existingImages = (property.imageUrls as string[]) || [];
    const updatedImages = [...existingImages, ...imageUrls];

    return await prisma.property.update({
      where: { id: propertyId },
      data: {
        imageUrls: updatedImages,
        primaryImageUrl: property.primaryImageUrl || imageUrls[0], // Set first image as primary if none exists
      },
    });
  }

  /**
   * Delete an image from a property
   */
  static async deleteImage(
    propertyId: string,
    userId: string,
    imageUrl: string
  ): Promise<Property> {
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    const existingImages = (property.imageUrls as string[]) || [];
    const updatedImages = existingImages.filter((url: string) => url !== imageUrl);

    // Delete the file from filesystem
    this.deleteImageFile(imageUrl);

    // If deleting the primary image, set a new one
    const newPrimaryImage =
      property.primaryImageUrl === imageUrl ? updatedImages[0] || null : property.primaryImageUrl;

    return await prisma.property.update({
      where: { id: propertyId },
      data: {
        imageUrls: updatedImages,
        primaryImageUrl: newPrimaryImage,
      },
    });
  }

  /**
   * Set primary image for a property
   */
  static async setPrimaryImage(
    propertyId: string,
    userId: string,
    imageUrl: string
  ): Promise<Property> {
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    const existingImages = (property.imageUrls as string[]) || [];
    if (!existingImages.includes(imageUrl)) {
      throw new Error('Image not found in property images');
    }

    return await prisma.property.update({
      where: { id: propertyId },
      data: {
        primaryImageUrl: imageUrl,
      },
    });
  }

  /**
   * Helper to delete image file from filesystem
   */
  private static deleteImageFile(imageUrl: string): void {
    try {
      const filename = path.basename(imageUrl);
      const filePath = path.join(__dirname, '../../uploads/properties', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting image file:', error);
    }
  }

  /**
   * Create or update expense template for a property
   */
  static async updateExpenseTemplate(propertyId: string, userId: string, expenses: any) {
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    return await prisma.propertyExpenseTemplate.upsert({
      where: { propertyId },
      update: expenses,
      create: {
        propertyId,
        ...expenses,
      },
    });
  }

  /**
   * Get expense template for a property
   */
  static async getExpenseTemplate(propertyId: string, userId: string) {
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    return await prisma.propertyExpenseTemplate.findUnique({
      where: { propertyId },
    });
  }

  /**
   * Add additional income source to a property
   */
  static async addIncomeSource(propertyId: string, userId: string, income: any) {
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    return await prisma.propertyIncome.create({
      data: {
        propertyId,
        ...income,
      },
    });
  }

  /**
   * Update income source
   */
  static async updateIncomeSource(incomeId: string, userId: string, income: any) {
    const existingIncome = await prisma.propertyIncome.findUnique({
      where: { id: incomeId },
      include: { property: true },
    });

    if (!existingIncome || existingIncome.property.userId !== userId) {
      throw new Error('Income source not found or unauthorized');
    }

    return await prisma.propertyIncome.update({
      where: { id: incomeId },
      data: income,
    });
  }

  /**
   * Delete income source
   */
  static async deleteIncomeSource(incomeId: string, userId: string) {
    const existingIncome = await prisma.propertyIncome.findUnique({
      where: { id: incomeId },
      include: { property: true },
    });

    if (!existingIncome || existingIncome.property.userId !== userId) {
      throw new Error('Income source not found or unauthorized');
    }

    return await prisma.propertyIncome.delete({
      where: { id: incomeId },
    });
  }

  /**
   * Get all income sources for a property
   */
  static async getIncomeSources(propertyId: string, userId: string) {
    const property = await this.getPropertyById(propertyId, userId);
    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    return await prisma.propertyIncome.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
