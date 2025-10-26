import { PrismaClient, Document } from '@prisma/client';

const prisma = new PrismaClient();

export class DocumentService {
  /**
   * Upload/Create a new document
   */
  static async createDocument(data: {
    userId: string;
    relatedEntityType: string; // 'PROPERTY', 'TENANT', 'LEASE', etc.
    relatedEntityId: string;
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: bigint;
    mimeType: string;
  }): Promise<Document> {
    return await prisma.document.create({
      data: {
        ...data,
        uploadDate: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(documentId: string): Promise<Document | null> {
    return await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all documents for a specific entity (e.g., property)
   */
  static async getDocumentsByEntity(
    relatedEntityType: string,
    relatedEntityId: string
  ): Promise<Document[]> {
    return await prisma.document.findMany({
      where: {
        relatedEntityType,
        relatedEntityId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { uploadDate: 'desc' },
    });
  }

  /**
   * Get documents by property ID
   */
  static async getDocumentsByProperty(propertyId: string): Promise<Document[]> {
    return await this.getDocumentsByEntity('PROPERTY', propertyId);
  }

  /**
   * Get documents by type for a property
   */
  static async getDocumentsByType(
    propertyId: string,
    documentType: string
  ): Promise<Document[]> {
    return await prisma.document.findMany({
      where: {
        relatedEntityType: 'PROPERTY',
        relatedEntityId: propertyId,
        documentType,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { uploadDate: 'desc' },
    });
  }

  /**
   * Get all documents for a user
   */
  static async getDocumentsByUser(userId: string): Promise<Document[]> {
    return await prisma.document.findMany({
      where: { userId },
      orderBy: { uploadDate: 'desc' },
    });
  }

  /**
   * Update document metadata
   */
  static async updateDocument(
    documentId: string,
    data: Partial<{
      documentType: string;
      fileName: string;
    }>
  ): Promise<Document> {
    return await prisma.document.update({
      where: { id: documentId },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Delete document
   */
  static async deleteDocument(documentId: string): Promise<void> {
    await prisma.document.delete({
      where: { id: documentId },
    });
  }

  /**
   * Search documents by filename
   */
  static async searchDocuments(
    userId: string,
    searchTerm: string
  ): Promise<Document[]> {
    return await prisma.document.findMany({
      where: {
        userId,
        fileName: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      orderBy: { uploadDate: 'desc' },
    });
  }

  /**
   * Get recent documents
   */
  static async getRecentDocuments(
    userId: string,
    limit: number = 10
  ): Promise<Document[]> {
    return await prisma.document.findMany({
      where: { userId },
      orderBy: { uploadDate: 'desc' },
      take: limit,
    });
  }

  /**
   * Get documents by multiple properties
   */
  static async getDocumentsByProperties(
    propertyIds: string[]
  ): Promise<Document[]> {
    return await prisma.document.findMany({
      where: {
        relatedEntityType: 'PROPERTY',
        relatedEntityId: {
          in: propertyIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { uploadDate: 'desc' },
    });
  }

  /**
   * Get storage statistics for a user
   */
  static async getStorageStatistics(userId: string): Promise<{
    totalDocuments: number;
    totalSize: bigint;
    byType: Record<string, { count: number; size: bigint }>;
  }> {
    const documents = await prisma.document.findMany({
      where: { userId },
      select: {
        documentType: true,
        fileSize: true,
      },
    });

    const totalSize = documents.reduce(
      (sum, doc) => sum + BigInt(doc.fileSize),
      BigInt(0)
    );

    // Group by document type
    const byType = documents.reduce((acc, doc) => {
      if (!acc[doc.documentType]) {
        acc[doc.documentType] = { count: 0, size: BigInt(0) };
      }
      acc[doc.documentType].count += 1;
      acc[doc.documentType].size += BigInt(doc.fileSize);
      return acc;
    }, {} as Record<string, { count: number; size: bigint }>);

    return {
      totalDocuments: documents.length,
      totalSize,
      byType,
    };
  }
}
