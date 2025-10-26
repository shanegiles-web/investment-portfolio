import { PrismaClient, PropertyDocument, PropertyDocumentType } from '@prisma/client';

const prisma = new PrismaClient();

export class PropertyDocumentService {
  /**
   * Upload/Create a new property document
   */
  static async createPropertyDocument(data: {
    propertyId: string;
    documentType: PropertyDocumentType;
    title: string;
    description?: string;
    fileUrl: string;
    fileName: string;
    fileSize: bigint;
    mimeType: string;
    uploadedBy?: string;
    tags?: any;
    expiryDate?: Date;
  }): Promise<PropertyDocument> {
    return await prisma.propertyDocument.create({
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
   * Get property document by ID
   */
  static async getPropertyDocumentById(
    documentId: string
  ): Promise<PropertyDocument | null> {
    return await prisma.propertyDocument.findUnique({
      where: { id: documentId },
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
   * Get all documents for a property
   */
  static async getDocumentsByProperty(
    propertyId: string
  ): Promise<PropertyDocument[]> {
    return await prisma.propertyDocument.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get documents by type for a property
   */
  static async getDocumentsByType(
    propertyId: string,
    documentType: PropertyDocumentType
  ): Promise<PropertyDocument[]> {
    return await prisma.propertyDocument.findMany({
      where: {
        propertyId,
        documentType,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update property document metadata
   */
  static async updatePropertyDocument(
    documentId: string,
    data: Partial<{
      documentType: PropertyDocumentType;
      title: string;
      description: string;
      tags: any;
      expiryDate: Date;
    }>
  ): Promise<PropertyDocument> {
    return await prisma.propertyDocument.update({
      where: { id: documentId },
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
   * Delete property document
   */
  static async deletePropertyDocument(documentId: string): Promise<void> {
    await prisma.propertyDocument.delete({
      where: { id: documentId },
    });
  }

  /**
   * Get expiring documents (within specified days)
   */
  static async getExpiringDocuments(
    days: number = 30
  ): Promise<PropertyDocument[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await prisma.propertyDocument.findMany({
      where: {
        expiryDate: {
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
      orderBy: { expiryDate: 'asc' },
    });
  }

  /**
   * Search documents by title
   */
  static async searchDocuments(
    propertyId: string,
    searchTerm: string
  ): Promise<PropertyDocument[]> {
    return await prisma.propertyDocument.findMany({
      where: {
        propertyId,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            fileName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
