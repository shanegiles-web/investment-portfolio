import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/analytics/portfolio
 * @desc    Get portfolio summary
 * @access  Private
 */
router.get('/portfolio', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const summary = await AnalyticsService.getPortfolioSummary(req.user.id);

    res.json({ summary });
  } catch (error: any) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio summary', details: error.message });
  }
});

/**
 * @route   POST /api/analytics/compare
 * @desc    Compare multiple properties
 * @access  Private
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { propertyIds } = req.body;

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ error: 'propertyIds array is required' });
    }

    const comparison = await AnalyticsService.compareProperties(propertyIds);

    res.json({ comparison });
  } catch (error: any) {
    console.error('Error comparing properties:', error);
    res.status(500).json({ error: 'Failed to compare properties', details: error.message });
  }
});

/**
 * @route   GET /api/analytics/cashflow/:propertyId
 * @desc    Get cash flow projection for a property
 * @access  Private
 */
router.get('/cashflow/:propertyId', async (req: Request, res: Response) => {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 12;

    const projection = await AnalyticsService.getCashFlowProjection(
      req.params.propertyId,
      months
    );

    res.json({ projection });
  } catch (error: any) {
    console.error('Error fetching cash flow projection:', error);
    res.status(500).json({ error: 'Failed to fetch cash flow projection', details: error.message });
  }
});

/**
 * @route   GET /api/analytics/occupancy
 * @desc    Get occupancy rate for user's portfolio
 * @access  Private
 */
router.get('/occupancy', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const occupancy = await AnalyticsService.getOccupancyRate(req.user.id);

    res.json({ occupancy });
  } catch (error: any) {
    console.error('Error fetching occupancy rate:', error);
    res.status(500).json({ error: 'Failed to fetch occupancy rate', details: error.message });
  }
});

/**
 * @route   GET /api/analytics/maintenance-costs/:propertyId
 * @desc    Get maintenance costs for a property within a date range
 * @access  Private
 */
router.get('/maintenance-costs/:propertyId', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const costs = await AnalyticsService.getMaintenanceCosts(
      req.params.propertyId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({ costs });
  } catch (error: any) {
    console.error('Error fetching maintenance costs:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance costs', details: error.message });
  }
});

/**
 * @route   GET /api/analytics/roi-trends/:propertyId
 * @desc    Get ROI trends for a property over time
 * @access  Private
 */
router.get('/roi-trends/:propertyId', async (req: Request, res: Response) => {
  try {
    const months = req.query.months ? parseInt(req.query.months as string) : 12;

    const trends = await AnalyticsService.getROITrends(
      req.params.propertyId,
      months
    );

    res.json({ trends });
  } catch (error: any) {
    console.error('Error fetching ROI trends:', error);
    res.status(500).json({ error: 'Failed to fetch ROI trends', details: error.message });
  }
});

/**
 * @route   GET /api/analytics/expenses/:propertyId
 * @desc    Get expense breakdown for a property
 * @access  Private
 */
router.get('/expenses/:propertyId', async (req: Request, res: Response) => {
  try {
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    const breakdown = await AnalyticsService.getExpenseBreakdown(
      req.params.propertyId,
      year
    );

    res.json({ breakdown });
  } catch (error: any) {
    console.error('Error fetching expense breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch expense breakdown', details: error.message });
  }
});

export default router;
