import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { ReportsService } from '../services/reportsService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/reports/performance
 * Get performance report with Time-Weighted Return
 * Query params: accountId, startDate, endDate
 */
router.get('/performance', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId, startDate, endDate } = req.query;

    const filters = {
      accountId: accountId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await ReportsService.getPerformanceReport(userId, filters);
    res.json(report);
  } catch (error) {
    console.error('Error generating performance report:', error);
    res.status(500).json({ error: 'Failed to generate performance report' });
  }
});

/**
 * GET /api/reports/allocation
 * Get asset allocation report
 * Query params: accountId, date
 */
router.get('/allocation', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId, date } = req.query;

    const report = await ReportsService.getAllocationReport(
      userId,
      accountId as string | undefined,
      date ? new Date(date as string) : undefined
    );
    res.json(report);
  } catch (error) {
    console.error('Error generating allocation report:', error);
    res.status(500).json({ error: 'Failed to generate allocation report' });
  }
});

/**
 * GET /api/reports/income
 * Get income analysis report
 * Query params: accountId, startDate, endDate
 */
router.get('/income', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId, startDate, endDate } = req.query;

    const filters = {
      accountId: accountId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await ReportsService.getIncomeReport(userId, filters);
    res.json(report);
  } catch (error) {
    console.error('Error generating income report:', error);
    res.status(500).json({ error: 'Failed to generate income report' });
  }
});

/**
 * GET /api/reports/activity
 * Get portfolio activity summary
 * Query params: accountId, startDate, endDate
 */
router.get('/activity', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId, startDate, endDate } = req.query;

    const filters = {
      accountId: accountId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const report = await ReportsService.getActivityReport(userId, filters);
    res.json(report);
  } catch (error) {
    console.error('Error generating activity report:', error);
    res.status(500).json({ error: 'Failed to generate activity report' });
  }
});

/**
 * GET /api/reports/gainloss
 * Get gain/loss report
 * Query params: accountId, startDate, endDate, type (realized|unrealized|all)
 */
router.get('/gainloss', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId, startDate, endDate, type } = req.query;

    const filters = {
      accountId: accountId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      type: (type as 'realized' | 'unrealized' | 'all') || 'all',
    };

    const report = await ReportsService.getGainLossReport(userId, filters);
    res.json(report);
  } catch (error) {
    console.error('Error generating gain/loss report:', error);
    res.status(500).json({ error: 'Failed to generate gain/loss report' });
  }
});

/**
 * GET /api/reports/holdings
 * Get holdings report
 * Query params: accountId, date
 */
router.get('/holdings', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId, date } = req.query;

    const report = await ReportsService.getHoldingsReport(
      userId,
      accountId as string | undefined,
      date ? new Date(date as string) : undefined
    );
    res.json(report);
  } catch (error) {
    console.error('Error generating holdings report:', error);
    res.status(500).json({ error: 'Failed to generate holdings report' });
  }
});

export default router;
