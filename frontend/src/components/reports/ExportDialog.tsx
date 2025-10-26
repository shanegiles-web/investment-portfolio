import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import apiClient from '../../api/client';

export type ExportFormat = 'csv' | 'excel' | 'pdf';
export type ReportType = 'performance' | 'allocation' | 'income' | 'activity' | 'gainloss' | 'holdings';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  reportType: ReportType;
  filters?: {
    startDate?: string;
    endDate?: string;
    accountId?: string;
  };
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, reportType, filters }) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(
        `/export/${reportType}/${format}`,
        {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          accountId: filters?.accountId,
        },
        {
          responseType: 'blob',
        }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${reportType}-report.${getFileExtension(format)}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err: any) {
      console.error('Error exporting report:', err);
      setError(err.response?.data?.error || 'Failed to export report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (fmt: ExportFormat): string => {
    switch (fmt) {
      case 'csv':
        return 'csv';
      case 'excel':
        return 'xlsx';
      case 'pdf':
        return 'pdf';
    }
  };

  const getFormatDescription = (fmt: ExportFormat): string => {
    switch (fmt) {
      case 'csv':
        return 'Comma-separated values, compatible with Excel and other tools';
      case 'excel':
        return 'Microsoft Excel format (.xlsx)';
      case 'pdf':
        return 'Portable Document Format';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Report</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl component="fieldset">
            <FormLabel component="legend">Select Export Format</FormLabel>
            <RadioGroup value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
              <FormControlLabel
                value="csv"
                control={<Radio />}
                label={
                  <Box>
                    <Box fontWeight="medium">CSV</Box>
                    <Box fontSize="0.875rem" color="text.secondary">
                      {getFormatDescription('csv')}
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="excel"
                control={<Radio />}
                label={
                  <Box>
                    <Box fontWeight="medium">Excel</Box>
                    <Box fontSize="0.875rem" color="text.secondary">
                      {getFormatDescription('excel')}
                    </Box>
                  </Box>
                }
              />
              <FormControlLabel
                value="pdf"
                control={<Radio />}
                label={
                  <Box>
                    <Box fontWeight="medium">PDF</Box>
                    <Box fontSize="0.875rem" color="text.secondary">
                      {getFormatDescription('pdf')}
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Download />}
          disabled={loading}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
