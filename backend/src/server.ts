import app from './app';
import { config } from './config/env';
import { testDatabaseConnection, disconnectDatabase } from './config/database';
import logger from './utils/logger';

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info('=================================');
      logger.info(`🚀 Server running in ${config.env} mode`);
      logger.info(`📡 Listening on port ${config.port}`);
      logger.info(`🌍 API URL: http://localhost:${config.port}/api`);
      logger.info(`💚 Health check: http://localhost:${config.port}/api/health`);
      logger.info('=================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        // Disconnect from database
        await disconnectDatabase();

        logger.info('Graceful shutdown complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
