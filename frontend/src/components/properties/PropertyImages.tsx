import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  IconButton,
  Typography,
  Dialog,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../store/store';
import type { Property } from '../../store/propertiesSlice';
import {
  uploadPropertyImages,
  deletePropertyImage,
  setPrimaryImage,
} from '../../store/propertiesSlice';
import { ImageUpload } from './ImageUpload';

interface PropertyImagesProps {
  property: Property;
}

export const PropertyImages: React.FC<PropertyImagesProps> = ({ property }) => {
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const images = property.imageUrls || [];
  const primaryImage = property.primaryImageUrl;

  const handleUpload = async (files: File[]) => {
    try {
      setError(null);
      await dispatch(
        uploadPropertyImages({ propertyId: property.id, files })
      ).unwrap();
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
      throw err;
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setError(null);
      await dispatch(
        deletePropertyImage({ propertyId: property.id, imageUrl })
      ).unwrap();
    } catch (err: any) {
      setError(err.message || 'Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageUrl: string) => {
    try {
      setError(null);
      await dispatch(
        setPrimaryImage({ propertyId: property.id, imageUrl })
      ).unwrap();
    } catch (err: any) {
      setError(err.message || 'Failed to set primary image');
    }
  };

  const getFullImageUrl = (url: string) => {
    // Use relative URL so it gets proxied through Vite to the backend
    return url;
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Upload Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Upload Images
        </Typography>
        <ImageUpload onUpload={handleUpload} maxFiles={10} />
      </Box>

      {/* Gallery Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Property Images ({images.length})
        </Typography>

        {images.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography>No images uploaded yet</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {images.map((imageUrl, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    paddingTop: '75%',
                    overflow: 'hidden',
                    '&:hover .image-actions': {
                      opacity: 1,
                    },
                  }}
                >
                  {/* Image */}
                  <Box
                    component="img"
                    src={getFullImageUrl(imageUrl)}
                    alt={`Property ${index + 1}`}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Primary Badge */}
                  {imageUrl === primaryImage && (
                    <Chip
                      label="Primary"
                      color="primary"
                      size="small"
                      icon={<StarIcon />}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                      }}
                    />
                  )}

                  {/* Action Buttons */}
                  <Box
                    className="image-actions"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setSelectedImage(imageUrl)}
                      sx={{
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' },
                      }}
                    >
                      <ZoomInIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleSetPrimary(imageUrl)}
                      disabled={imageUrl === primaryImage}
                      sx={{
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' },
                      }}
                      title="Set as primary image"
                    >
                      {imageUrl === primaryImage ? (
                        <StarIcon color="primary" />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleDelete(imageUrl)}
                      sx={{
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'white',
                        },
                      }}
                      title="Delete image"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Lightbox Dialog */}
      <Dialog
        open={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ position: 'relative', bgcolor: 'black' }}>
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedImage && (
            <Box
              component="img"
              src={getFullImageUrl(selectedImage)}
              alt="Full size"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};
