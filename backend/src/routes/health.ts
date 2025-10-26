import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'disconnected',
      uptime: process.uptime(),
    });
  }
});

export default router;
