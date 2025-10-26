import { Router, Request, Response } from 'express';
import { TenantService } from '../services/tenantService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tenants
 * @desc    Get all tenants (optionally filtered)
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { isActive, propertyId } = req.query;

    const filters: any = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    if (propertyId) {
      filters.propertyId = propertyId as string;
    }

    const tenants = await TenantService.getAllTenants(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    res.json({ tenants });
  } catch (error: any) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants', details: error.message });
  }
});

/**
 * @route   GET /api/tenants/search
 * @desc    Search tenants by name, email, or phone
 * @access  Private
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const tenants = await TenantService.searchTenants(q);
    res.json({ tenants });
  } catch (error: any) {
    console.error('Error searching tenants:', error);
    res.status(500).json({ error: 'Failed to search tenants', details: error.message });
  }
});

/**
 * @route   GET /api/tenants/:id
 * @desc    Get tenant by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = await TenantService.getTenantById(id);

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({ tenant });
  } catch (error: any) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant', details: error.message });
  }
});

/**
 * @route   POST /api/tenants
 * @desc    Create a new tenant
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
  console.log('🟢 [TenantRoute] POST /api/tenants called');
  console.log('📥 Request body:', req.body);

  try {
    const {
      propertyId,
      firstName,
      lastName,
      email,
      phone,
      emergencyContact,
      emergencyPhone,
      moveInDate,
      moveOutDate,
      notes,
    } = req.body;

    console.log('🔍 [TenantRoute] Validating required fields...');

    // Validation
    if (!propertyId || !firstName || !lastName || !moveInDate) {
      console.warn('⚠️ [TenantRoute] Validation failed - missing required fields');
      return res.status(400).json({
        error: 'Missing required fields: propertyId, firstName, lastName, moveInDate',
      });
    }

    console.log('✅ [TenantRoute] Validation passed');
    console.log('⏳ [TenantRoute] Calling TenantService.createTenant...');

    const tenant = await TenantService.createTenant({
      propertyId,
      firstName,
      lastName,
      email,
      phone,
      emergencyContact,
      emergencyPhone,
      moveInDate: new Date(moveInDate),
      moveOutDate: moveOutDate ? new Date(moveOutDate) : undefined,
      notes,
    });

    console.log('✅ [TenantRoute] Tenant created successfully:', tenant.id);
    console.log('📤 [TenantRoute] Sending 201 response with tenant data');

    res.status(201).json({ tenant });
  } catch (error: any) {
    console.error('❌ [TenantRoute] Error creating tenant:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to create tenant', details: error.message });
  }
});

/**
 * @route   PUT /api/tenants/:id
 * @desc    Update tenant
 * @access  Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: any = {};

    const allowedFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'emergencyContact',
      'emergencyPhone',
      'moveInDate',
      'moveOutDate',
      'isActive',
      'notes',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'moveInDate' || field === 'moveOutDate') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    const tenant = await TenantService.updateTenant(id, updateData);
    res.json({ tenant });
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant', details: error.message });
  }
});

/**
 * @route   POST /api/tenants/:id/move-out
 * @desc    Mark tenant as moved out
 * @access  Private
 */
router.post('/:id/move-out', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { moveOutDate } = req.body;

    if (!moveOutDate) {
      return res.status(400).json({ error: 'moveOutDate is required' });
    }

    const tenant = await TenantService.markTenantMovedOut(
      id,
      new Date(moveOutDate)
    );

    res.json({ tenant });
  } catch (error: any) {
    console.error('Error marking tenant moved out:', error);
    res.status(500).json({
      error: 'Failed to mark tenant as moved out',
      details: error.message,
    });
  }
});

/**
 * @route   DELETE /api/tenants/:id
 * @desc    Delete tenant
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TenantService.deleteTenant(id);
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant', details: error.message });
  }
});

export default router;
