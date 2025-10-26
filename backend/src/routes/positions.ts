import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PositionService } from '../services/positionService';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createPositionSchema = z.object({
  body: z.object({
    accountId: z.string().uuid('Invalid account ID'),
    investmentTypeId: z.string().uuid('Invalid investment type ID'),
    symbol: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    shares: z.number().positive('Shares must be positive'),
    costBasisTotal: z.number().nonnegative('Cost basis cannot be negative'),
    currentPrice: z.number().nonnegative('Price cannot be negative'),
  }),
});

const updatePositionSchema = z.object({
  body: z.object({
    symbol: z.string().optional(),
    name: z.string().optional(),
    shares: z.number().positive().optional(),
    costBasisTotal: z.number().nonnegative().optional(),
    currentPrice: z.number().nonnegative().optional(),
  }),
});

const updatePriceSchema = z.object({
  body: z.object({
    price: z.number().nonnegative('Price cannot be negative'),
  }),
});

/**
 * GET /api/positions
 * Get all positions for the authenticated user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const positions = await PositionService.getPositions(userId);
    res.status(200).json({ positions });
  } catch (error) {
    console.error('Error in GET /positions:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch positions',
    });
  }
});

/**
 * GET /api/positions/stats
 * Get portfolio statistics
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const stats = await PositionService.getPortfolioStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    });
  }
});

/**
 * GET /api/positions/account/:accountId
 * Get all positions for a specific account
 */
router.get('/account/:accountId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;

    const positions = await PositionService.getPositionsByAccount(accountId, userId);
    res.status(200).json({ positions });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch positions',
      });
    }
  }
});

/**
 * GET /api/positions/:id
 * Get a single position by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const positionId = req.params.id;

    const position = await PositionService.getPositionById(positionId, userId);

    if (!position) {
      res.status(404).json({ error: 'Position not found' });
      return;
    }

    res.status(200).json({ position });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      res.status(403).json({ error: 'Unauthorized' });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch position',
      });
    }
  }
});

/**
 * POST /api/positions
 * Create a new position
 */
router.post(
  '/',
  validateRequest(createPositionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const position = await PositionService.createPosition(userId, req.body);
      res.status(201).json({ position });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to create position',
        });
      }
    }
  }
);

/**
 * PUT /api/positions/:id
 * Update a position
 */
router.put(
  '/:id',
  validateRequest(updatePositionSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const positionId = req.params.id;

      const position = await PositionService.updatePosition(positionId, userId, req.body);
      res.status(200).json({ position });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to update position',
        });
      }
    }
  }
);

/**
 * PATCH /api/positions/:id/price
 * Update position price only
 */
router.patch(
  '/:id/price',
  validateRequest(updatePriceSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const positionId = req.params.id;
      const { price } = req.body;

      const position = await PositionService.updatePositionPrice(positionId, userId, price);
      res.status(200).json({ position });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to update price',
        });
      }
    }
  }
);

/**
 * DELETE /api/positions/:id
 * Delete a position
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const positionId = req.params.id;

    const position = await PositionService.deletePosition(positionId, userId);
    res.status(200).json({ position, message: 'Position deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete position',
      });
    }
  }
});

export default router;
