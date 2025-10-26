import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/investment-types
 * Get all investment types
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await prisma.investmentType.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.status(200).json({ investmentTypes: types });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch investment types',
    });
  }
});

export default router;
