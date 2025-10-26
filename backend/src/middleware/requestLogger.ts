import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info(`➡️  ${req.method} ${req.path}`);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '🔴' : '✅';
    logger.info(`${statusColor} ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
