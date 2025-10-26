import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /**
   * Whether to allow vertical scrolling within the container
   * @default true
   */
  scrollable?: boolean;
  /**
   * Maximum width of the content area
   * @default '100%'
   */
  maxWidth?: string | number;
}

/**
 * PageContainer - A responsive container component that ensures consistent
 * layout behavior across all pages in the application.
 *
 * Features:
 * - Uses full viewport width
 * - Prevents horizontal overflow
 * - Manages vertical scrolling
 * - Consistent spacing and padding
 */
export const PageContainer = ({
  children,
  scrollable = true,
  maxWidth = '100%'
}: PageContainerProps) => {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        p: 2,
        overflow: scrollable ? 'auto' : 'hidden',
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#ccc',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: '#aaa',
          },
        },
      }}
    >
      {children}
    </Box>
  );
};


