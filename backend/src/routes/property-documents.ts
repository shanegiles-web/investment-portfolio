import { Router, Request, Response } from 'express';
import { PropertyDocumentService } from '../services/propertyDocumentService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/property-documents
 * @desc    Get all property documents for a property
 * @access  Private
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.query;

    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId is required' });
    }

    const documents = await PropertyDocumentService.getDocumentsByProperty(
      propertyId as string
    );

    res.json({ documents });
  } catch (error: any) {
    console.error('Error fetching property documents:', error);
    res.status(500).json({ error: 'Failed to fetch property documents', details: error.message });
  }
});

/**
 * @route   GET /api/property-documents/expiring
 * @desc    Get expiring documents (within specified days)
 * @access  Private
 */
router.get('/expiring', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const documents = await PropertyDocumentService.getExpiringDocuments(days);

    res.json({ documents, expiringWithinDays: days });
  } catch (error: any) {
    console.error('Error fetching expiring documents:', error);
    res.status(500).json({ error: 'Failed to fetch expiring documents', details: error.message });
  }
});

/**
 * @route   GET /api/property-documents/:id
 * @desc    Get property document by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const document = await PropertyDocumentService.getPropertyDocumentById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error: any) {
    console.error('Error fetching property document:', error);
    res.status(500).json({ error: 'Failed to fetch property document', details: error.message });
  }
});

/**
 * @route   POST /api/property-documents
 * @desc    Create a new property document
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const document = await PropertyDocumentService.createPropertyDocument(req.body);

    res.status(201).json({ document, message: 'Property document created successfully' });
  } catch (error: any) {
    console.error('Error creating property document:', error);
    res.status(500).json({ error: 'Failed to create property document', details: error.message });
  }
});

/**
 * @route   PUT /api/property-documents/:id
 * @desc    Update property document metadata
 * @access  Private
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const document = await PropertyDocumentService.updatePropertyDocument(
      req.params.id,
      req.body
    );

    res.json({ document, message: 'Property document updated successfully' });
  } catch (error: any) {
    console.error('Error updating property document:', error);
    res.status(500).json({ error: 'Failed to update property document', details: error.message });
  }
});

/**
 * @route   DELETE /api/property-documents/:id
 * @desc    Delete property document
 * @access  Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await PropertyDocumentService.deletePropertyDocument(req.params.id);

    res.json({ message: 'Property document deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting property document:', error);
    res.status(500).json({ error: 'Failed to delete property document', details: error.message });
  }
});

export default router;
