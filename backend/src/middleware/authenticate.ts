import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token and get user
    const user = await AuthService.verifyToken(token);

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};
