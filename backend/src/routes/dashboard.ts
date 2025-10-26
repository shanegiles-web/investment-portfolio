import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { DashboardService } from '../services/dashboardService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data for the authenticated user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const dashboardData = await DashboardService.getDashboardData(userId);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

/**
 * GET /api/dashboard/net-worth
 * Get net worth history
 */
router.get('/net-worth', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const netWorth = await DashboardService.getNetWorthHistory(userId);
    res.json(netWorth);
  } catch (error) {
    console.error('Error fetching net worth:', error);
    res.status(500).json({ error: 'Failed to fetch net worth data' });
  }
});

export default router;
