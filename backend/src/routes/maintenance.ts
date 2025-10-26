import { Router, Request, Response } from 'express';
import { MaintenanceService } from '../services/maintenanceService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/maintenance
 * @desc    Get all maintenance requests (optionally filtered)
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, category, propertyId } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (propertyId) filters.propertyId = propertyId as string;

    const maintenanceRequests = await MaintenanceService.getAllMaintenance(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.json({ maintenanceRequests });
  } catch (error: any) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance requests', details: error.message });
  }
});

/**
 * @route   GET /api/maintenance/upcoming
 * @desc    Get upcoming maintenance (scheduled within next N days)
 * @access  Private
 */
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;

    const maintenanceRequests = await MaintenanceService.getUpcomingMaintenance(days);

    res.json({ maintenanceRequests, upcomingWithinDays: days });
  } catch (error: any) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming maintenance', details: error.message });
  }
});

/**
 * @route   GET /api/maintenance/emergency
 * @desc    Get emergency maintenance requests
 * @access  Private
 */
router.get('/emergency', async (req: Request, res: Response) => {
  try {
    const maintenanceRequests = await MaintenanceService.getEmergencyMaintenance();

    res.json({ maintenanceRequests });
  } catch (error: any) {
    console.error('Error fetching emergency maintenance:', error);
    res.status(500).json({ error: 'Failed to fetch emergency maintenance', details: error.message });
  }
});

/**
 * @route   GET /api/maintenance/:id
 * @desc    Get maintenance request by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const maintenanceRequest = await MaintenanceService.getMaintenanceById(req.params.id);

    if (!maintenanceRequest) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    res.json({ maintenanceRequest });
  } catch (error: any) {
    console.error('Error fetching maintenance request:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance request', details: error.message });
  }
});

/**
 * @route   POST /api/maintenance
 * @desc    Create a new maintenance request
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const maintenanceRequest = await MaintenanceService.createMaintenanceRequest(req.body);

    res.status(201).json({ maintenanceRequest, message: 'Maintenance request created successfully' });
  } catch (error: any) {
    console.error('Error creating maintenance request:', error);
    res.status(500).json({ error: 'Failed to create maintenance request', details: error.message });
  }
});

/**
 * @route   PUT /api/maintenance/:id
 * @desc    Update maintenance request
 * @access  Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const maintenanceRequest = await MaintenanceService.updateMaintenanceRequest(
      req.params.id,
      req.body
    );

    res.json({ maintenanceRequest, message: 'Maintenance request updated successfully' });
  } catch (error: any) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({ error: 'Failed to update maintenance request', details: error.message });
  }
});

/**
 * @route   POST /api/maintenance/:id/schedule
 * @desc    Schedule maintenance request
 * @access  Private
 */
router.post('/:id/schedule', async (req: Request, res: Response) => {
  try {
    const { scheduledDate, assignedTo } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ error: 'scheduledDate is required' });
    }

    const maintenanceRequest = await MaintenanceService.scheduleMaintenanceRequest(
      req.params.id,
      new Date(scheduledDate),
      assignedTo
    );

    res.json({ maintenanceRequest, message: 'Maintenance request scheduled successfully' });
  } catch (error: any) {
    console.error('Error scheduling maintenance request:', error);
    res.status(500).json({ error: 'Failed to schedule maintenance request', details: error.message });
  }
});

/**
 * @route   POST /api/maintenance/:id/start
 * @desc    Mark maintenance as in progress
 * @access  Private
 */
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const maintenanceRequest = await MaintenanceService.startMaintenance(req.params.id);

    res.json({ maintenanceRequest, message: 'Maintenance marked as in progress' });
  } catch (error: any) {
    console.error('Error starting maintenance:', error);
    res.status(500).json({ error: 'Failed to start maintenance', details: error.message });
  }
});

/**
 * @route   POST /api/maintenance/:id/complete
 * @desc    Complete maintenance request
 * @access  Private
 */
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { actualCost, notes } = req.body;

    if (actualCost === undefined) {
      return res.status(400).json({ error: 'actualCost is required' });
    }

    const maintenanceRequest = await MaintenanceService.completeMaintenanceRequest(
      req.params.id,
      actualCost,
      notes
    );

    res.json({ maintenanceRequest, message: 'Maintenance request completed successfully' });
  } catch (error: any) {
    console.error('Error completing maintenance request:', error);
    res.status(500).json({ error: 'Failed to complete maintenance request', details: error.message });
  }
});

/**
 * @route   POST /api/maintenance/:id/cancel
 * @desc    Cancel maintenance request
 * @access  Private
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    const maintenanceRequest = await MaintenanceService.cancelMaintenanceRequest(
      req.params.id,
      reason
    );

    res.json({ maintenanceRequest, message: 'Maintenance request cancelled' });
  } catch (error: any) {
    console.error('Error cancelling maintenance request:', error);
    res.status(500).json({ error: 'Failed to cancel maintenance request', details: error.message });
  }
});

/**
 * @route   DELETE /api/maintenance/:id
 * @desc    Delete maintenance request
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await MaintenanceService.deleteMaintenanceRequest(req.params.id);

    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting maintenance request:', error);
    res.status(500).json({ error: 'Failed to delete maintenance request', details: error.message });
  }
});

export default router;
