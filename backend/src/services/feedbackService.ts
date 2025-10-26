import { PrismaClient, Feedback } from '@prisma/client';

const prisma = new PrismaClient();

export class FeedbackService {
  /**
   * Create feedback
   */
  static async createFeedback(data: {
    userId: string;
    page: string;
    category: string;
    comment: string;
  }): Promise<Feedback> {
    console.log('🟣 [FeedbackService] createFeedback called');
    console.log('📝 Input data:', data);

    try {
      const feedback = await prisma.feedback.create({
        data,
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

      console.log('✅ [FeedbackService] Feedback created:', feedback.id);
      return feedback;
    } catch (error: any) {
      console.error('❌ [FeedbackService] Error:', error);
      throw error;
    }
  }

  /**
   * Get all feedback (for admin/settings page)
   */
  static async getAllFeedback(filters?: {
    status?: string;
    category?: string;
  }): Promise<Feedback[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.category) {
      where.category = filters.category;
    }

    return await prisma.feedback.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update feedback status/priority
   */
  static async updateFeedback(
    id: string,
    data: {
      status?: string;
      priority?: string;
    }
  ): Promise<Feedback> {
    return await prisma.feedback.update({
      where: { id },
      data,
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
   * Delete feedback
   */
  static async deleteFeedback(id: string): Promise<void> {
    await prisma.feedback.delete({
      where: { id },
    });
  }
}
