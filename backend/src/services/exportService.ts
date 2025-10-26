import { createObjectCsvWriter } from 'csv-writer';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import { ReportsService } from './reportsService';

export type ExportFormat = 'csv' | 'excel' | 'pdf';
export type ReportType = 'performance' | 'allocation' | 'income' | 'activity' | 'gainloss' | 'holdings';

export interface ExportOptions {
  userId: string;
  reportType: ReportType;
  format: ExportFormat;
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
}

export class ExportService {
  private static reportsService = new ReportsService();

  /**
   * Export a report to the specified format
   */
  static async exportReport(options: ExportOptions): Promise<Buffer> {
    const { format, reportType } = options;

    switch (format) {
      case 'csv':
        return await this.exportToCSV(options);
      case 'excel':
        return await this.exportToExcel(options);
      case 'pdf':
        return await this.exportToPDF(options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export report to CSV format
   */
  private static async exportToCSV(options: ExportOptions): Promise<Buffer> {
    const data = await this.getReportData(options);
    const { reportType } = options;

    // Create a temporary file path
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFile = path.join(tempDir, `${reportType}-${Date.now()}.csv`);

    try {
      let csvWriter;
      let records: any[] = [];

      switch (reportType) {
        case 'performance':
          csvWriter = createObjectCsvWriter({
            path: tempFile,
            header: [
              { id: 'metric', title: 'Metric' },
              { id: 'value', title: 'Value' },
            ],
          });
          records = [
            { metric: 'Total Value', value: data.totalValue },
            { metric: 'Total Return', value: data.totalReturn },
            { metric: 'Total Return %', value: data.totalReturnPercent },
            { metric: 'Time-Weighted Return', value: data.timeWeightedReturn },
          ];
          break;

        case 'allocation':
          csvWriter = createObjectCsvWriter({
            path: tempFile,
            header: [
              { id: 'category', title: 'Category' },
              { id: 'value', title: 'Value' },
              { id: 'percentage', title: 'Percentage' },
            ],
          });
          records = Object.entries(data.byCategory).map(([category, info]: [string, any]) => ({
            category,
            value: info.value,
            percentage: ((info.value / data.totalValue) * 100).toFixed(2) + '%',
          }));
          break;

        case 'income':
          csvWriter = createObjectCsvWriter({
            path: tempFile,
            header: [
              { id: 'position', title: 'Position' },
              { id: 'totalIncome', title: 'Total Income' },
              { id: 'dividends', title: 'Dividends' },
              { id: 'interest', title: 'Interest' },
            ],
          });
          records = data.byPosition.map((item: any) => ({
            position: item.positionName,
            totalIncome: item.totalIncome,
            dividends: item.dividends,
            interest: item.interest,
          }));
          break;

        case 'activity':
          csvWriter = createObjectCsvWriter({
            path: tempFile,
            header: [
              { id: 'type', title: 'Transaction Type' },
              { id: 'count', title: 'Count' },
              { id: 'totalAmount', title: 'Total Amount' },
            ],
          });
          records = Object.entries(data.byType).map(([type, info]: [string, any]) => ({
            type,
            count: info.count,
            totalAmount: info.totalAmount,
          }));
          break;

        case 'gainloss':
          csvWriter = createObjectCsvWriter({
            path: tempFile,
            header: [
              { id: 'position', title: 'Position' },
              { id: 'realizedGainLoss', title: 'Realized Gain/Loss' },
              { id: 'unrealizedGainLoss', title: 'Unrealized Gain/Loss' },
              { id: 'totalGainLoss', title: 'Total Gain/Loss' },
            ],
          });
          records = data.positions.map((item: any) => ({
            position: item.name,
            realizedGainLoss: item.realizedGainLoss || 0,
            unrealizedGainLoss: item.unrealizedGainLoss,
            totalGainLoss: (item.realizedGainLoss || 0) + item.unrealizedGainLoss,
          }));
          break;

        case 'holdings':
          csvWriter = createObjectCsvWriter({
            path: tempFile,
            header: [
              { id: 'position', title: 'Position' },
              { id: 'account', title: 'Account' },
              { id: 'category', title: 'Category' },
              { id: 'quantity', title: 'Quantity' },
              { id: 'currentPrice', title: 'Current Price' },
              { id: 'currentValue', title: 'Current Value' },
              { id: 'costBasis', title: 'Cost Basis' },
              { id: 'gainLoss', title: 'Gain/Loss' },
              { id: 'gainLossPercent', title: 'Gain/Loss %' },
            ],
          });
          records = data.holdings.map((item: any) => ({
            position: item.name,
            account: item.accountName,
            category: item.category,
            quantity: item.quantity,
            currentPrice: item.currentPrice,
            currentValue: item.currentValue,
            costBasis: item.costBasis,
            gainLoss: item.gainLoss,
            gainLossPercent: item.gainLossPercent.toFixed(2) + '%',
          }));
          break;

        default:
          throw new Error(`Unsupported report type: ${reportType}`);
      }

      await csvWriter.writeRecords(records);
      const buffer = fs.readFileSync(tempFile);
      return buffer;
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  /**
   * Export report to Excel format
   */
  private static async exportToExcel(options: ExportOptions): Promise<Buffer> {
    const data = await this.getReportData(options);
    const { reportType } = options;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.getReportTitle(reportType));

    // Style for headers
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF1976D2' } },
      alignment: { horizontal: 'center' as const, vertical: 'middle' as const },
    };

    switch (reportType) {
      case 'performance':
        worksheet.columns = [
          { header: 'Metric', key: 'metric', width: 30 },
          { header: 'Value', key: 'value', width: 20 },
        ];
        worksheet.getRow(1).font = headerStyle.font;
        worksheet.getRow(1).fill = headerStyle.fill;
        worksheet.getRow(1).alignment = headerStyle.alignment;

        worksheet.addRow({ metric: 'Total Value', value: `$${data.totalValue.toFixed(2)}` });
        worksheet.addRow({ metric: 'Total Return', value: `$${data.totalReturn.toFixed(2)}` });
        worksheet.addRow({ metric: 'Total Return %', value: `${data.totalReturnPercent.toFixed(2)}%` });
        worksheet.addRow({ metric: 'Time-Weighted Return', value: `${data.timeWeightedReturn.toFixed(2)}%` });
        break;

      case 'allocation':
        worksheet.columns = [
          { header: 'Category', key: 'category', width: 25 },
          { header: 'Value', key: 'value', width: 20 },
          { header: 'Percentage', key: 'percentage', width: 15 },
        ];
        worksheet.getRow(1).font = headerStyle.font;
        worksheet.getRow(1).fill = headerStyle.fill;
        worksheet.getRow(1).alignment = headerStyle.alignment;

        Object.entries(data.byCategory).forEach(([category, info]: [string, any]) => {
          worksheet.addRow({
            category,
            value: `$${info.value.toFixed(2)}`,
            percentage: `${((info.value / data.totalValue) * 100).toFixed(2)}%`,
          });
        });
        break;

      case 'income':
        worksheet.columns = [
          { header: 'Position', key: 'position', width: 30 },
          { header: 'Total Income', key: 'totalIncome', width: 20 },
          { header: 'Dividends', key: 'dividends', width: 20 },
          { header: 'Interest', key: 'interest', width: 20 },
        ];
        worksheet.getRow(1).font = headerStyle.font;
        worksheet.getRow(1).fill = headerStyle.fill;
        worksheet.getRow(1).alignment = headerStyle.alignment;

        data.byPosition.forEach((item: any) => {
          worksheet.addRow({
            position: item.positionName,
            totalIncome: `$${item.totalIncome.toFixed(2)}`,
            dividends: `$${item.dividends.toFixed(2)}`,
            interest: `$${item.interest.toFixed(2)}`,
          });
        });
        break;

      case 'activity':
        worksheet.columns = [
          { header: 'Transaction Type', key: 'type', width: 25 },
          { header: 'Count', key: 'count', width: 15 },
          { header: 'Total Amount', key: 'totalAmount', width: 20 },
        ];
        worksheet.getRow(1).font = headerStyle.font;
        worksheet.getRow(1).fill = headerStyle.fill;
        worksheet.getRow(1).alignment = headerStyle.alignment;

        Object.entries(data.byType).forEach(([type, info]: [string, any]) => {
          worksheet.addRow({
            type,
            count: info.count,
            totalAmount: `$${info.totalAmount.toFixed(2)}`,
          });
        });
        break;

      case 'gainloss':
        worksheet.columns = [
          { header: 'Position', key: 'position', width: 30 },
          { header: 'Realized Gain/Loss', key: 'realized', width: 20 },
          { header: 'Unrealized Gain/Loss', key: 'unrealized', width: 20 },
          { header: 'Total Gain/Loss', key: 'total', width: 20 },
        ];
        worksheet.getRow(1).font = headerStyle.font;
        worksheet.getRow(1).fill = headerStyle.fill;
        worksheet.getRow(1).alignment = headerStyle.alignment;

        data.positions.forEach((item: any) => {
          worksheet.addRow({
            position: item.name,
            realized: `$${(item.realizedGainLoss || 0).toFixed(2)}`,
            unrealized: `$${item.unrealizedGainLoss.toFixed(2)}`,
            total: `$${((item.realizedGainLoss || 0) + item.unrealizedGainLoss).toFixed(2)}`,
          });
        });
        break;

      case 'holdings':
        worksheet.columns = [
          { header: 'Position', key: 'position', width: 25 },
          { header: 'Account', key: 'account', width: 20 },
          { header: 'Category', key: 'category', width: 20 },
          { header: 'Quantity', key: 'quantity', width: 15 },
          { header: 'Current Price', key: 'price', width: 15 },
          { header: 'Current Value', key: 'value', width: 18 },
          { header: 'Cost Basis', key: 'costBasis', width: 18 },
          { header: 'Gain/Loss', key: 'gainLoss', width: 18 },
          { header: 'Gain/Loss %', key: 'gainLossPercent', width: 15 },
        ];
        worksheet.getRow(1).font = headerStyle.font;
        worksheet.getRow(1).fill = headerStyle.fill;
        worksheet.getRow(1).alignment = headerStyle.alignment;

        data.holdings.forEach((item: any) => {
          worksheet.addRow({
            position: item.name,
            account: item.accountName,
            category: item.category,
            quantity: item.quantity,
            price: `$${item.currentPrice.toFixed(2)}`,
            value: `$${item.currentValue.toFixed(2)}`,
            costBasis: `$${item.costBasis.toFixed(2)}`,
            gainLoss: `$${item.gainLoss.toFixed(2)}`,
            gainLossPercent: `${item.gainLossPercent.toFixed(2)}%`,
          });
        });
        break;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Export report to PDF format
   */
  private static async exportToPDF(options: ExportOptions): Promise<Buffer> {
    const data = await this.getReportData(options);
    const { reportType } = options;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text(this.getReportTitle(reportType), { align: 'center' });
      doc.moveDown();

      // Date range
      if (options.startDate && options.endDate) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(
            `Period: ${options.startDate.toLocaleDateString()} - ${options.endDate.toLocaleDateString()}`,
            { align: 'center' }
          );
        doc.moveDown();
      }

      doc.fontSize(12).font('Helvetica');

      switch (reportType) {
        case 'performance':
          this.addPDFTable(doc, ['Metric', 'Value'], [
            ['Total Value', `$${data.totalValue.toFixed(2)}`],
            ['Total Return', `$${data.totalReturn.toFixed(2)}`],
            ['Total Return %', `${data.totalReturnPercent.toFixed(2)}%`],
            ['Time-Weighted Return', `${data.timeWeightedReturn.toFixed(2)}%`],
          ]);
          break;

        case 'allocation':
          const allocationRows = Object.entries(data.byCategory).map(([category, info]: [string, any]) => [
            category,
            `$${info.value.toFixed(2)}`,
            `${((info.value / data.totalValue) * 100).toFixed(2)}%`,
          ]);
          this.addPDFTable(doc, ['Category', 'Value', 'Percentage'], allocationRows);
          break;

        case 'income':
          const incomeRows = data.byPosition.map((item: any) => [
            item.positionName,
            `$${item.totalIncome.toFixed(2)}`,
            `$${item.dividends.toFixed(2)}`,
            `$${item.interest.toFixed(2)}`,
          ]);
          this.addPDFTable(doc, ['Position', 'Total Income', 'Dividends', 'Interest'], incomeRows);
          break;

        case 'activity':
          const activityRows = Object.entries(data.byType).map(([type, info]: [string, any]) => [
            type,
            info.count.toString(),
            `$${info.totalAmount.toFixed(2)}`,
          ]);
          this.addPDFTable(doc, ['Transaction Type', 'Count', 'Total Amount'], activityRows);
          break;

        case 'gainloss':
          const gainLossRows = data.positions.map((item: any) => [
            item.name,
            `$${(item.realizedGainLoss || 0).toFixed(2)}`,
            `$${item.unrealizedGainLoss.toFixed(2)}`,
            `$${((item.realizedGainLoss || 0) + item.unrealizedGainLoss).toFixed(2)}`,
          ]);
          this.addPDFTable(doc, ['Position', 'Realized', 'Unrealized', 'Total'], gainLossRows);
          break;

        case 'holdings':
          const holdingsRows = data.holdings.map((item: any) => [
            item.name,
            item.accountName,
            item.quantity.toString(),
            `$${item.currentPrice.toFixed(2)}`,
            `$${item.currentValue.toFixed(2)}`,
            `$${item.gainLoss.toFixed(2)}`,
          ]);
          this.addPDFTable(doc, ['Position', 'Account', 'Qty', 'Price', 'Value', 'Gain/Loss'], holdingsRows);
          break;
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();
    });
  }

  /**
   * Helper to add a table to PDF
   */
  private static addPDFTable(doc: typeof PDFDocument.prototype, headers: string[], rows: string[][]): void {
    const tableTop = doc.y;
    const columnWidth = (doc.page.width - 100) / headers.length;

    // Headers
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, 50 + i * columnWidth, tableTop, { width: columnWidth, align: 'left' });
    });

    doc.moveDown();
    doc.font('Helvetica');

    // Rows
    rows.forEach((row) => {
      const rowTop = doc.y;
      row.forEach((cell, i) => {
        doc.text(cell, 50 + i * columnWidth, rowTop, { width: columnWidth, align: 'left' });
      });
      doc.moveDown(0.5);
    });
  }

  /**
   * Get report data based on report type
   */
  private static async getReportData(options: ExportOptions): Promise<any> {
    const { userId, reportType, startDate, endDate, accountId } = options;

    switch (reportType) {
      case 'performance':
        return await this.reportsService.getPerformanceReport(userId, startDate, endDate, accountId);
      case 'allocation':
        return await this.reportsService.getAllocationReport(userId, accountId);
      case 'income':
        return await this.reportsService.getIncomeReport(userId, startDate, endDate, accountId);
      case 'activity':
        return await this.reportsService.getActivityReport(userId, startDate, endDate, accountId);
      case 'gainloss':
        return await this.reportsService.getGainLossReport(userId, startDate, endDate, accountId);
      case 'holdings':
        return await this.reportsService.getHoldingsReport(userId, accountId);
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }

  /**
   * Get human-readable report title
   */
  private static getReportTitle(reportType: ReportType): string {
    const titles: Record<ReportType, string> = {
      performance: 'Performance Report',
      allocation: 'Asset Allocation Report',
      income: 'Income Report',
      activity: 'Activity Report',
      gainloss: 'Gain/Loss Report',
      holdings: 'Holdings Report',
    };
    return titles[reportType];
  }
}
