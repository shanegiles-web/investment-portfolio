import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { ExportService, type ExportFormat, type ReportType } from '../services/exportService';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/export/:reportType/:format
 * Export a report to the specified format
 */
router.post('/:reportType/:format', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const reportType = req.params.reportType as ReportType;
    const format = req.params.format as ExportFormat;
    const { startDate, endDate, accountId } = req.body;

    // Validate report type
    const validReportTypes: ReportType[] = ['performance', 'allocation', 'income', 'activity', 'gainloss', 'holdings'];
    if (!validReportTypes.includes(reportType)) {
      res.status(400).json({ error: `Invalid report type: ${reportType}` });
      return;
    }

    // Validate format
    const validFormats: ExportFormat[] = ['csv', 'excel', 'pdf'];
    if (!validFormats.includes(format)) {
      res.status(400).json({ error: `Invalid export format: ${format}` });
      return;
    }

    // Export the report
    const buffer = await ExportService.exportReport({
      userId,
      reportType,
      format,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accountId,
    });

    // Set appropriate headers
    const timestamp = new Date().toISOString().split('T')[0];
    let contentType: string;
    let fileExtension: string;

    switch (format) {
      case 'csv':
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      case 'excel':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${timestamp}.${fileExtension}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export report',
    });
  }
});

/**
 * GET /api/export/formats
 * Get list of available export formats
 */
router.get('/formats', async (req: Request, res: Response): Promise<void> => {
  res.json({
    formats: [
      { value: 'csv', label: 'CSV', description: 'Comma-separated values, compatible with Excel and other tools' },
      { value: 'excel', label: 'Excel', description: 'Microsoft Excel format (.xlsx)' },
      { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
    ],
  });
});

export default router;
