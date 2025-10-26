import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { api } from '../api/client';
import { FeedbackButton } from '../components/common/FeedbackButton';

interface Feedback {
  id: string;
  page: string;
  category: string;
  comment: string;
  status: string;
  priority: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const Settings = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const response = await api.get<{ feedback: Feedback[] }>(
        `/feedback?${params.toString()}`
      );
      setFeedback(response.feedback);
    } catch (err: any) {
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [statusFilter, categoryFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/feedback/${id}`, { status });
      loadFeedback();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleUpdatePriority = async (id: string, priority: string) => {
    try {
      await api.put(`/feedback/${id}`, { priority });
      loadFeedback();
    } catch (err: any) {
      setError(err.message || 'Failed to update priority');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await api.delete(`/feedback/${id}`);
      loadFeedback();
    } catch (err: any) {
      setError(err.message || 'Failed to delete feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'info';
      case 'Reviewed':
        return 'default';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Application settings and user feedback
      </Typography>

      {/* User Feedback Section */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              User Feedback
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadFeedback}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {/* Filters */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="Reviewed">Reviewed</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>

            <TextField
              select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="General">General</MenuItem>
              <MenuItem value="Bug">Bug Report</MenuItem>
              <MenuItem value="Feature Request">Feature Request</MenuItem>
              <MenuItem value="Improvement">Improvement</MenuItem>
            </TextField>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : feedback.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No feedback found
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Page</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Comment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedback.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(item.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.user.firstName} {item.user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={item.page} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={item.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {item.comment}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          SelectProps={{ native: false }}
                        >
                          <MenuItem value="New">New</MenuItem>
                          <MenuItem value="Reviewed">Reviewed</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                          <MenuItem value="Rejected">Rejected</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={item.priority}
                          onChange={(e) => handleUpdatePriority(item.id, e.target.value)}
                          SelectProps={{ native: false }}
                        >
                          <MenuItem value="Low">Low</MenuItem>
                          <MenuItem value="Medium">Medium</MenuItem>
                          <MenuItem value="High">High</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Feedback Button */}
      <FeedbackButton page="Settings" />
    </Box>
  );
};
