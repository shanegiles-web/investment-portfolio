import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import accountsRouter from './accounts';
import positionsRouter from './positions';
import investmentTypesRouter from './investmentTypes';
import transactionsRouter from './transactions';
import dashboardRouter from './dashboard';
import reportsRouter from './reports';
import exportRouter from './export';
import propertiesRouter from './properties';
import tenantsRouter from './tenants';
import leasesRouter from './leases';
import maintenanceRouter from './maintenance';
import propertyDocumentsRouter from './property-documents';
import analyticsRouter from './analytics';
import feedbackRouter from './feedback';

const router = Router();

// Mount routes
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/accounts', accountsRouter);
router.use('/positions', positionsRouter);
router.use('/investment-types', investmentTypesRouter);
router.use('/transactions', transactionsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reports', reportsRouter);
router.use('/export', exportRouter);
router.use('/properties', propertiesRouter);
router.use('/tenants', tenantsRouter);
router.use('/leases', leasesRouter);
router.use('/maintenance', maintenanceRouter);
router.use('/property-documents', propertyDocumentsRouter);
router.use('/analytics', analyticsRouter);
router.use('/feedback', feedbackRouter);

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Investment Portfolio Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        me: '/api/auth/me',
        logout: '/api/auth/logout',
      },
      accounts: {
        list: '/api/accounts',
        stats: '/api/accounts/stats',
        get: '/api/accounts/:id',
        create: '/api/accounts',
        update: '/api/accounts/:id',
        delete: '/api/accounts/:id',
      },
      positions: {
        list: '/api/positions',
        stats: '/api/positions/stats',
        byAccount: '/api/positions/account/:accountId',
        get: '/api/positions/:id',
        create: '/api/positions',
        update: '/api/positions/:id',
        updatePrice: '/api/positions/:id/price',
        delete: '/api/positions/:id',
      },
      transactions: {
        list: '/api/transactions',
        stats: '/api/transactions/stats',
        byAccount: '/api/transactions/account/:accountId',
        byPosition: '/api/transactions/position/:positionId',
        get: '/api/transactions/:id',
        create: '/api/transactions',
        update: '/api/transactions/:id',
        delete: '/api/transactions/:id',
      },
      dashboard: {
        overview: '/api/dashboard',
        netWorth: '/api/dashboard/net-worth',
      },
      reports: {
        performance: '/api/reports/performance',
        allocation: '/api/reports/allocation',
        income: '/api/reports/income',
        activity: '/api/reports/activity',
        gainloss: '/api/reports/gainloss',
        holdings: '/api/reports/holdings',
      },
    },
  });
});

export default router;
