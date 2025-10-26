import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  TransactionService,
  createTransactionSchema,
  updateTransactionSchema,
} from '../services/transactionService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/transactions
 * Get all transactions for the authenticated user
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const transactions = await TransactionService.getTransactions(userId);
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/transactions/stats
 * Get transaction statistics for the authenticated user
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const stats = await TransactionService.getTransactionStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch transaction statistics' });
  }
});

/**
 * GET /api/transactions/account/:accountId
 * Get all transactions for a specific account
 */
router.get('/account/:accountId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accountId } = req.params;
    const transactions = await TransactionService.getTransactionsByAccount(userId, accountId);
    res.json({ transactions });
  } catch (error: any) {
    console.error('Error fetching account transactions:', error);
    if (error.message === 'Account not found or access denied') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch account transactions' });
    }
  }
});

/**
 * GET /api/transactions/position/:positionId
 * Get all transactions for a specific position
 */
router.get('/position/:positionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { positionId } = req.params;
    const transactions = await TransactionService.getTransactionsByPosition(userId, positionId);
    res.json({ transactions });
  } catch (error: any) {
    console.error('Error fetching position transactions:', error);
    if (error.message === 'Position not found or access denied') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch position transactions' });
    }
  }
});

/**
 * GET /api/transactions/:id
 * Get a specific transaction by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const transaction = await TransactionService.getTransaction(userId, id);
    res.json({ transaction });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    if (error.message === 'Transaction not found or access denied') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }
});

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const validated = createTransactionSchema.parse(req.body);
    const transaction = await TransactionService.createTransaction(userId, validated);
    res.status(201).json({ transaction });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else if (
      error.message === 'Account not found or access denied' ||
      error.message === 'Position not found or access denied'
    ) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }
});

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validated = updateTransactionSchema.parse(req.body);
    const transaction = await TransactionService.updateTransaction(userId, id, validated);
    res.json({ transaction });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation error', details: error.errors });
    } else if (error.message === 'Transaction not found or access denied') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    await TransactionService.deleteTransaction(userId, id);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    if (error.message === 'Transaction not found or access denied') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
});

export default router;
