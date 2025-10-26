import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AccountService } from '../services/accountService';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createAccountSchema = z.object({
  body: z.object({
    accountType: z.string().min(1, 'Account type is required'),
    accountName: z.string().min(1, 'Account name is required'),
    institution: z.string().optional(),
    accountNumber: z.string().optional(),
    taxTreatment: z.enum(['TAXABLE', 'TAX_DEFERRED', 'TAX_EXEMPT']),
    owner: z.string().optional(),
    beneficiaries: z.record(z.any()).optional(),
  }),
});

const updateAccountSchema = z.object({
  body: z.object({
    accountType: z.string().optional(),
    accountName: z.string().optional(),
    institution: z.string().optional(),
    accountNumber: z.string().optional(),
    taxTreatment: z.enum(['TAXABLE', 'TAX_DEFERRED', 'TAX_EXEMPT']).optional(),
    owner: z.string().optional(),
    beneficiaries: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * GET /api/accounts
 * Get all accounts for the authenticated user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const accounts = await AccountService.getAccounts(userId);
    res.status(200).json({ accounts });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch accounts',
    });
  }
});

/**
 * GET /api/accounts/stats
 * Get account statistics for the authenticated user
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const stats = await AccountService.getAccountStats(userId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch account stats',
    });
  }
});

/**
 * GET /api/accounts/:id
 * Get a single account by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const accountId = req.params.id;

    const account = await AccountService.getAccountById(accountId, userId);

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    res.status(200).json({ account });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch account',
    });
  }
});

/**
 * POST /api/accounts
 * Create a new account
 */
router.post(
  '/',
  validateRequest(createAccountSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const account = await AccountService.createAccount(userId, req.body);
      res.status(201).json({ account });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create account',
      });
    }
  }
);

/**
 * PUT /api/accounts/:id
 * Update an account
 */
router.put(
  '/:id',
  validateRequest(updateAccountSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const accountId = req.params.id;

      const account = await AccountService.updateAccount(accountId, userId, req.body);
      res.status(200).json({ account });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to update account',
        });
      }
    }
  }
);

/**
 * DELETE /api/accounts/:id
 * Delete an account (soft delete)
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const accountId = req.params.id;

    const account = await AccountService.deleteAccount(accountId, userId);
    res.status(200).json({ account, message: 'Account deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete account',
      });
    }
  }
});

export default router;
