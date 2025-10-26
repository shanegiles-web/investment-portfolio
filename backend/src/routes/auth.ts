import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateRequest(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Registration failed'
        });
      }
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validateRequest(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Login failed'
        });
      }
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user (protected route)
 */
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ user: req.user });
  }
);

/**
 * POST /api/auth/logout
 * Logout user (protected route)
 * Note: With JWT, logout is typically handled client-side by removing the token
 */
router.post(
  '/logout',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'Logged out successfully' });
  }
);

export default router;
