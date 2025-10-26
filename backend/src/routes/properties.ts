import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { PropertyService } from '../services/propertyService';
import { PropertyFinancialService } from '../services/propertyFinancialService';
import { uploadMultipleImages } from '../middleware/uploadImage';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/properties
 * Get all properties for the authenticated user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const properties = await PropertyService.getProperties(userId);
    res.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch properties',
    });
  }
});

/**
 * GET /api/properties/:id
 * Get a single property by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const property = await PropertyService.getPropertyById(id, userId);

    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    res.json({ property });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch property',
    });
  }
});

/**
 * POST /api/properties
 * Create a new property
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const property = await PropertyService.createProperty(userId, req.body);
    res.status(201).json({ property });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create property',
    });
  }
});

/**
 * PUT /api/properties/:id
 * Update a property
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const property = await PropertyService.updateProperty(id, userId, req.body);
    res.json({ property });
  } catch (error) {
    console.error('Error updating property:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update property',
      });
    }
  }
});

/**
 * DELETE /api/properties/:id
 * Delete a property
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const property = await PropertyService.deleteProperty(id, userId);
    res.json({ property, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete property',
      });
    }
  }
});

/**
 * POST /api/properties/:id/images
 * Upload images for a property
 */
router.post('/:id/images', uploadMultipleImages, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No images uploaded' });
      return;
    }

    // Generate URLs for uploaded images
    const imageUrls = req.files.map((file) => `/uploads/properties/${file.filename}`);

    const property = await PropertyService.addImages(id, userId, imageUrls);
    res.json({ property, uploadedImages: imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to upload images',
    });
  }
});

/**
 * DELETE /api/properties/:id/images
 * Delete an image from a property
 */
router.delete('/:id/images', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    const property = await PropertyService.deleteImage(id, userId, imageUrl);
    res.json({ property, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete image',
    });
  }
});

/**
 * PUT /api/properties/:id/images/primary
 * Set primary image for a property
 */
router.put('/:id/images/primary', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    const property = await PropertyService.setPrimaryImage(id, userId, imageUrl);
    res.json({ property, message: 'Primary image set successfully' });
  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to set primary image',
    });
  }
});

/**
 * GET /api/properties/:id/financials
 * Get comprehensive financial analysis for a property
 */
router.get('/:id/financials', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const property = await PropertyService.getPropertyById(id, userId);
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    const financials = await PropertyFinancialService.calculateFinancials(id);
    res.json({ financials });
  } catch (error) {
    console.error('Error calculating financials:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate financials',
    });
  }
});

/**
 * GET /api/properties/:id/expenses
 * Get expense template for a property
 */
router.get('/:id/expenses', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const expenses = await PropertyService.getExpenseTemplate(id, userId);
    const breakdown = await PropertyFinancialService.getExpenseBreakdown(id);

    res.json({ expenses, breakdown });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch expenses',
    });
  }
});

/**
 * PUT /api/properties/:id/expenses
 * Update expense template for a property
 */
router.put('/:id/expenses', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const expenses = await PropertyService.updateExpenseTemplate(id, userId, req.body);
    res.json({ expenses });
  } catch (error) {
    console.error('Error updating expenses:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update expenses',
    });
  }
});

/**
 * GET /api/properties/:id/income
 * Get all income sources for a property
 */
router.get('/:id/income', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const incomeSources = await PropertyService.getIncomeSources(id, userId);
    const breakdown = await PropertyFinancialService.getIncomeBreakdown(id);

    res.json({ incomeSources, breakdown });
  } catch (error) {
    console.error('Error fetching income sources:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch income sources',
    });
  }
});

/**
 * POST /api/properties/:id/income
 * Add an income source to a property
 */
router.post('/:id/income', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const income = await PropertyService.addIncomeSource(id, userId, req.body);
    res.status(201).json({ income });
  } catch (error) {
    console.error('Error adding income source:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to add income source',
    });
  }
});

/**
 * PUT /api/properties/:id/income/:incomeId
 * Update an income source
 */
router.put('/:id/income/:incomeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { incomeId } = req.params;

    const income = await PropertyService.updateIncomeSource(incomeId, userId, req.body);
    res.json({ income });
  } catch (error) {
    console.error('Error updating income source:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update income source',
    });
  }
});

/**
 * DELETE /api/properties/:id/income/:incomeId
 * Delete an income source
 */
router.delete('/:id/income/:incomeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { incomeId } = req.params;

    const income = await PropertyService.deleteIncomeSource(incomeId, userId);
    res.json({ income, message: 'Income source deleted successfully' });
  } catch (error) {
    console.error('Error deleting income source:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete income source',
    });
  }
});

export default router;
