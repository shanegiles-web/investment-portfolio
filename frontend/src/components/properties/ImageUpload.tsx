import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

interface ImageUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
  autoNotify?: boolean; // If true, notify parent when files are selected (no upload button)
  onChange?: (files: File[]) => void; // Callback for file selection (used with autoNotify)
}

interface ImagePreview {
  file: File;
  url: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  disabled = false,
  autoNotify = false,
  onChange,
}) => {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-notify parent when files change (for form integration)
  useEffect(() => {
    if (autoNotify && onChange) {
      const files = previews.map((p) => p.file);
      onChange(files);
    }
  }, [previews, autoNotify, onChange]);

  const validateFile = (file: File): boolean => {
    if (!acceptedFormats.includes(file.type)) {
      setError(`File ${file.name} is not a supported image format`);
      return false;
    }

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File ${file.name} exceeds ${maxSizeMB}MB size limit`);
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      // Check total number of files
      if (previews.length + fileArray.length > maxFiles) {
        setError(`Cannot upload more than ${maxFiles} images`);
        return;
      }

      // Validate each file
      for (const file of fileArray) {
        if (validateFile(file)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      // Create previews
      const newPreviews: ImagePreview[] = validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
      setError(null);
    },
    [previews, maxFiles, acceptedFormats, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].url);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const files = previews.map((p) => p.file);
      await onUpload(files);

      // Clear previews after successful upload
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setPreviews([]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      {/* Drop Zone */}
      <Paper
        variant="outlined"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1,
          '&:hover': disabled
            ? {}
            : {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
        }}
      >
        <input
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          style={{ display: 'none' }}
          id="image-upload-input"
        />

        <label htmlFor="image-upload-input">
          <Stack spacing={2} alignItems="center">
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />

            <Typography variant="h6" color="text.secondary">
              {isDragging
                ? 'Drop images here'
                : 'Drag and drop images here, or click to browse'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Supported formats: JPEG, PNG, GIF, WebP
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Max {maxFiles} files, {maxSizeMB}MB each
            </Typography>

            <Button
              variant="contained"
              component="span"
              disabled={disabled || isUploading}
              startIcon={<ImageIcon />}
            >
              Select Images
            </Button>
          </Stack>
        </label>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Images ({previews.length})
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 2,
              mt: 2,
            }}
          >
            {previews.map((preview, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  position: 'relative',
                  paddingTop: '100%',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={preview.url}
                  alt={`Preview ${index + 1}`}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                <IconButton
                  size="small"
                  onClick={() => removePreview(index)}
                  disabled={isUploading}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'white',
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    p: 0.5,
                    fontSize: '0.7rem',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {preview.file.name}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Upload Progress */}
          {isUploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Uploading images...
              </Typography>
            </Box>
          )}

          {/* Upload Button (only show if not auto-notify mode) */}
          {!autoNotify && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={isUploading || previews.length === 0}
                startIcon={<UploadIcon />}
              >
                Upload {previews.length} {previews.length === 1 ? 'Image' : 'Images'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  previews.forEach((preview) => URL.revokeObjectURL(preview.url));
                  setPreviews([]);
                  setError(null);
                }}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
