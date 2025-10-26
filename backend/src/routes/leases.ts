import { Router, Request, Response } from 'express';
import { LeaseService } from '../services/leaseService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/leases
 * @desc    Get all leases (optionally filtered)
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, isActive } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const leases = await LeaseService.getAllLeases(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.json({ leases });
  } catch (error: any) {
    console.error('Error fetching leases:', error);
    res.status(500).json({ error: 'Failed to fetch leases', details: error.message });
  }
});

/**
 * @route   GET /api/leases/expiring
 * @desc    Get leases expiring within specified days
 * @access  Private
 */
router.get('/expiring', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const leases = await LeaseService.getExpiringLeases(days);

    res.json({ leases, expiringWithinDays: days });
  } catch (error: any) {
    console.error('Error fetching expiring leases:', error);
    res.status(500).json({ error: 'Failed to fetch expiring leases', details: error.message });
  }
});

/**
 * @route   GET /api/leases/calendar
 * @desc    Get lease calendar for a date range
 * @access  Private
 */
router.get('/calendar', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const leases = await LeaseService.getLeaseCalendar(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json({ leases });
  } catch (error: any) {
    console.error('Error fetching lease calendar:', error);
    res.status(500).json({ error: 'Failed to fetch lease calendar', details: error.message });
  }
});

/**
 * @route   GET /api/leases/:id
 * @desc    Get lease by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lease = await LeaseService.getLeaseById(req.params.id);

    if (!lease) {
      return res.status(404).json({ error: 'Lease not found' });
    }

    res.json({ lease });
  } catch (error: any) {
    console.error('Error fetching lease:', error);
    res.status(500).json({ error: 'Failed to fetch lease', details: error.message });
  }
});

/**
 * @route   POST /api/leases
 * @desc    Create a new lease
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const lease = await LeaseService.createLease(req.body);

    res.status(201).json({ lease, message: 'Lease created successfully' });
  } catch (error: any) {
    console.error('Error creating lease:', error);
    res.status(500).json({ error: 'Failed to create lease', details: error.message });
  }
});

/**
 * @route   PUT /api/leases/:id
 * @desc    Update lease
 * @access  Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const lease = await LeaseService.updateLease(req.params.id, req.body);

    res.json({ lease, message: 'Lease updated successfully' });
  } catch (error: any) {
    console.error('Error updating lease:', error);
    res.status(500).json({ error: 'Failed to update lease', details: error.message });
  }
});

/**
 * @route   POST /api/leases/:id/terminate
 * @desc    Terminate a lease
 * @access  Private
 */
router.post('/:id/terminate', async (req: Request, res: Response) => {
  try {
    const { terminationDate } = req.body;

    if (!terminationDate) {
      return res.status(400).json({ error: 'terminationDate is required' });
    }

    const lease = await LeaseService.terminateLease(
      req.params.id,
      new Date(terminationDate)
    );

    res.json({ lease, message: 'Lease terminated successfully' });
  } catch (error: any) {
    console.error('Error terminating lease:', error);
    res.status(500).json({ error: 'Failed to terminate lease', details: error.message });
  }
});

/**
 * @route   POST /api/leases/:id/renew
 * @desc    Renew a lease
 * @access  Private
 */
router.post('/:id/renew', async (req: Request, res: Response) => {
  try {
    const { newEndDate, newMonthlyRent } = req.body;

    if (!newEndDate) {
      return res.status(400).json({ error: 'newEndDate is required' });
    }

    const lease = await LeaseService.renewLease(
      req.params.id,
      new Date(newEndDate),
      newMonthlyRent
    );

    res.json({ lease, message: 'Lease renewed successfully' });
  } catch (error: any) {
    console.error('Error renewing lease:', error);
    res.status(500).json({ error: 'Failed to renew lease', details: error.message });
  }
});

/**
 * @route   DELETE /api/leases/:id
 * @desc    Delete lease
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await LeaseService.deleteLease(req.params.id);

    res.json({ message: 'Lease deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lease:', error);
    res.status(500).json({ error: 'Failed to delete lease', details: error.message });
  }
});

export default router;
