# Investment Portfolio Management - Frontend

A modern, responsive React application built with TypeScript, Material-UI, and Redux Toolkit.

## Tech Stack

- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Fast build tool and dev server
- **Material-UI (MUI) 7** - Component library
- **Redux Toolkit 2** - State management
- **React Router 7** - Routing
- **Axios** - HTTP client
- **ESLint & Prettier** - Code quality

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Backend API running on port 3001

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot-reload

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types
```

## Project Structure

```
src/
├── api/                 # API client and service layer
├── components/          # Reusable components
├── hooks/               # Custom React hooks
├── layouts/             # Layout components
│   └── MainLayout.tsx   # Main app layout with navigation
├── pages/               # Page components
│   ├── Dashboard.tsx    # Dashboard page
│   ├── Accounts.tsx     # Accounts management
│   ├── Positions.tsx    # Investment positions
│   ├── Transactions.tsx # Transaction history
│   ├── Reports.tsx      # Reports and analytics
│   └── Settings.tsx     # Application settings
├── store/               # Redux store and slices
├── theme/               # MUI theme configuration
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Root component
└── main.tsx             # Application entry point
```

## Features

✅ **Routing** - React Router with nested routes
✅ **Layout** - Responsive layout with drawer navigation
✅ **Theme** - Material-UI theme matching design system
✅ **State Management** - Redux Toolkit store configured
✅ **API Client** - Axios with interceptors and error handling
✅ **TypeScript** - Full type safety throughout
✅ **Pages** - Dashboard, Accounts, Positions, Transactions, Reports, Settings

### Dashboard Features

- Backend health check on load
- Summary cards (net worth, accounts, positions)
- Real-time backend connection status

## API Integration

API calls are proxied through Vite in development (`/api` → `http://localhost:3001`).

```typescript
import { api, healthApi } from '@/api';

// Use the API client
const status = await healthApi.check();
const data = await api.get('/endpoint');
```

## Theme

Colors follow the design system:
- Primary: #1976d2 (Blue)
- Secondary: #2e7d32 (Green)
- Spacing: 8px grid system

## Development Guidelines

- Use functional components with hooks
- Prefer TypeScript interfaces over types
- Use MUI's `sx` prop for styling
- Keep components focused and small

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

**Status:** ✅ Foundation Complete
**Last Updated:** October 23, 2025
