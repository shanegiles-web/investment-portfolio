import { Router, Request, Response } from 'express';
import { FeedbackService } from '../services/feedbackService';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback
 * @access  Private
 */
router.post('/', async (req: Request, res: Response) => {
  console.log('🟢 [FeedbackRoute] POST /api/feedback called');
  console.log('📥 Request body:', req.body);

  try {
    const { page, category, comment } = req.body;
    const userId = (req as any).user.id;

    if (!page || !comment) {
      console.warn('⚠️ [FeedbackRoute] Validation failed');
      return res.status(400).json({
        error: 'Missing required fields: page, comment',
      });
    }

    console.log('✅ [FeedbackRoute] Validation passed');
    console.log('⏳ [FeedbackRoute] Calling FeedbackService.createFeedback...');

    const feedback = await FeedbackService.createFeedback({
      userId,
      page,
      category: category || 'General',
      comment,
    });

    console.log('✅ [FeedbackRoute] Feedback created:', feedback.id);
    console.log('📤 [FeedbackRoute] Sending 201 response');

    res.status(201).json({ feedback });
  } catch (error: any) {
    console.error('❌ [FeedbackRoute] Error:', error);
    res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
  }
});

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback
 * @access  Private (Admin only in production)
 */
router.get('/', async (req: Request, res: Response) => {
  console.log('🟢 [FeedbackRoute] GET /api/feedback called');

  try {
    const { status, category } = req.query;

    const feedback = await FeedbackService.getAllFeedback({
      status: status as string,
      category: category as string,
    });

    console.log('✅ [FeedbackRoute] Retrieved feedback:', feedback.length);
    res.json({ feedback });
  } catch (error: any) {
    console.error('❌ [FeedbackRoute] Error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback', details: error.message });
  }
});

/**
 * @route   PUT /api/feedback/:id
 * @desc    Update feedback status/priority
 * @access  Private (Admin only in production)
 */
router.put('/:id', async (req: Request, res: Response) => {
  console.log('🟢 [FeedbackRoute] PUT /api/feedback/:id called');

  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const feedback = await FeedbackService.updateFeedback(id, {
      status,
      priority,
    });

    console.log('✅ [FeedbackRoute] Feedback updated:', feedback.id);
    res.json({ feedback });
  } catch (error: any) {
    console.error('❌ [FeedbackRoute] Error:', error);
    res.status(500).json({ error: 'Failed to update feedback', details: error.message });
  }
});

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback
 * @access  Private (Admin only in production)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  console.log('🟢 [FeedbackRoute] DELETE /api/feedback/:id called');

  try {
    const { id } = req.params;

    await FeedbackService.deleteFeedback(id);

    console.log('✅ [FeedbackRoute] Feedback deleted');
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    console.error('❌ [FeedbackRoute] Error:', error);
    res.status(500).json({ error: 'Failed to delete feedback', details: error.message });
  }
});

export default router;
