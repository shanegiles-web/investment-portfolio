import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
};
