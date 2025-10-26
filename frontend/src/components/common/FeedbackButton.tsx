import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Feedback as FeedbackIcon } from '@mui/icons-material';
import { api } from '../../api/client';

interface FeedbackButtonProps {
  page: string; // Current page/section name
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ page }) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('General');
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post('/feedback', {
        page,
        category,
        comment: comment.trim(),
      });

      setSuccess(true);
      setComment('');
      setCategory('General');

      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setOpen(false);
      setComment('');
      setCategory('General');
      setError('');
      setSuccess(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="feedback"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <FeedbackIcon />
      </Fab>

      {/* Feedback Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Send Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Help us improve the app by sharing your thoughts, reporting bugs, or suggesting new features.
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                Thank you! Your feedback has been submitted.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ mt: 2 }}
              disabled={submitting}
            >
              <MenuItem value="General">General Feedback</MenuItem>
              <MenuItem value="Bug">Bug Report</MenuItem>
              <MenuItem value="Feature Request">Feature Request</MenuItem>
              <MenuItem value="Improvement">Improvement</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={5}
              label="Your Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what's on your mind..."
              sx={{ mt: 2 }}
              disabled={submitting}
              required
            />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Page: {page}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !comment.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
