# System Architecture & Migration Strategy

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Architecture](#database-architecture)
5. [Security Architecture](#security-architecture)
6. [Integration Architecture](#integration-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Migration Strategy](#migration-strategy)

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │    Tablet    │      │
│  │  (React PWA) │  │  (React PWA) │  │  (React PWA) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/WSS
┌───────────────────────────┴─────────────────────────────────┐
│                     API Gateway Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Load Balancer / API Gateway / Rate Limiting           │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Server  │  │  API Server  │  │  API Server  │      │
│  │  (Node.js)   │  │  (Node.js)   │  │  (Node.js)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Background   │  │   Scheduler  │  │  WebSocket   │      │
│  │   Workers    │  │    (Cron)    │  │    Server    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   S3/Blob    │      │
│  │   Database   │  │    Cache     │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   External Services                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth0/      │  │  Financial   │  │    Email     │      │
│  │  Supabase    │  │  Data APIs   │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **UI Components**: Material-UI (MUI) or shadcn/ui
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Tables**: TanStack Table v8
- **API Client**: RTK Query / Axios

### Folder Structure
```
frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── service-worker.js
├── src/
│   ├── api/                  # API service layer
│   │   ├── accounts.ts
│   │   ├── transactions.ts
│   │   └── ...
│   ├── components/           # Reusable components
│   │   ├── common/
│   │   ├── forms/
│   │   ├── tables/
│   │   └── charts/
│   ├── features/             # Feature-based modules
│   │   ├── auth/
│   │   ├── accounts/
│   │   ├── positions/
│   │   ├── transactions/
│   │   ├── properties/
│   │   ├── farms/
│   │   └── reports/
│   ├── hooks/                # Custom React hooks
│   ├── layouts/              # Layout components
│   ├── pages/                # Page components
│   ├── store/                # Redux store
│   ├── types/                # TypeScript types
│   ├── utils/                # Utility functions
│   ├── theme/                # MUI theme configuration
│   ├── App.tsx
│   └── main.tsx
├── tests/
└── package.json
```

### State Management Strategy
- **Redux Toolkit** for global application state
- **RTK Query** for server state and caching
- **Local State** (useState) for component-specific state
- **Form State** managed by React Hook Form

### Code Splitting
- Route-based code splitting
- Lazy loading for heavy components
- Dynamic imports for large libraries

---

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma or TypeORM
- **Validation**: Zod
- **Authentication**: JWT + Passport.js
- **Background Jobs**: Bull + Redis
- **API Documentation**: Swagger/OpenAPI

### Folder Structure
```
backend/
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   └── app.ts
│   ├── controllers/          # Request handlers
│   │   ├── authController.ts
│   │   ├── accountsController.ts
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── authService.ts
│   │   ├── accountsService.ts
│   │   └── ...
│   ├── models/               # Database models (if not using ORM)
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/               # API routes
│   │   ├── auth.ts
│   │   ├── accounts.ts
│   │   └── ...
│   ├── utils/                # Utility functions
│   ├── jobs/                 # Background jobs
│   │   ├── priceUpdate.ts
│   │   ├── reports.ts
│   │   └── ...
│   ├── types/                # TypeScript types
│   ├── validators/           # Zod schemas
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── tests/
├── prisma/                   # Prisma schema
│   └── schema.prisma
└── package.json
```

### Layered Architecture
1. **Routes Layer**: Handles HTTP requests, validation
2. **Controller Layer**: Orchestrates service calls
3. **Service Layer**: Business logic
4. **Data Access Layer**: Database operations
5. **Model Layer**: Data structures

### API Design Principles
- RESTful endpoints
- Consistent naming conventions
- Proper HTTP status codes
- Error handling with standard format
- Request validation at entry point
- Response pagination for list endpoints

---

## Database Architecture

### PostgreSQL Schema Organization

#### Schema Layers
1. **Core Schema**: Users, accounts, positions, transactions
2. **Real Estate Schema**: Properties, leases, property transactions
3. **Business Schema**: Entities, farm operations
4. **Analytics Schema**: Performance metrics, calculated views
5. **System Schema**: Audit logs, documents

#### Indexing Strategy
- Primary keys: Clustered indexes
- Foreign keys: Non-clustered indexes
- Common query fields: Composite indexes
- Date ranges: B-tree indexes
- JSON fields: GIN indexes (for JSONB)

#### Data Partitioning
- **Transactions table**: Partitioned by year
- **Prices table**: Partitioned by symbol or date
- **Audit log**: Partitioned by month

#### Views and Materialized Views
- **Current Portfolio Value**: Materialized view (refreshed hourly)
- **Account Balances**: Materialized view (refreshed daily)
- **Performance Metrics**: Calculated views
- **Tax Lot Summary**: View for tax reporting

---

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Server validates against database
3. JWT token issued (access + refresh)
4. Client stores token (httpOnly cookie or secure storage)
5. Token included in subsequent requests
6. Server validates token and extracts user info

### Authorization Levels
- **Admin**: Full access, user management
- **Owner**: Full access to own data
- **View-only**: Read access to shared data
- **Guest**: Limited preview access

### Security Measures
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: TLS 1.3
- **Password Storage**: bcrypt hashing (12 rounds)
- **SQL Injection**: Parameterized queries
- **XSS Prevention**: Input sanitization, CSP headers
- **CSRF Protection**: CSRF tokens
- **Rate Limiting**: API rate limits per user/IP
- **Input Validation**: Zod schemas on all inputs

### Data Privacy
- **PII Protection**: Encryption for sensitive fields
- **Audit Logging**: All data modifications logged
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: Data export and deletion endpoints

---

## Integration Architecture

### External APIs

#### Financial Data Providers
- **Primary**: Alpha Vantage
- **Backup**: Yahoo Finance, IEX Cloud
- **Rate Limits**: Managed with exponential backoff
- **Caching**: 15-minute cache for real-time prices
- **Error Handling**: Graceful fallback to cached data

#### Broker Integrations
- **Vanguard**: CSV import (no API)
- **Fidelity**: REST API
- **Schwab**: REST API
- **Interactive Brokers**: TWS API

#### Authentication Providers
- **Auth0** or **Supabase Auth**
- OAuth 2.0 / OpenID Connect
- Social logins (Google, Apple)
- Multi-factor authentication

### Data Import Pipeline
```
CSV/Excel File
    ↓
Upload to S3
    ↓
Parse & Validate
    ↓
Transform to Standard Format
    ↓
Deduplicate
    ↓
Insert into Database
    ↓
Trigger Recalculation
    ↓
Notify User
```

---

## Deployment Architecture

### Cloud Provider: AWS (Example)

#### Infrastructure
- **Compute**: ECS (Elastic Container Service) or EC2
- **Database**: RDS PostgreSQL (Multi-AZ)
- **Cache**: ElastiCache Redis
- **Storage**: S3 for documents/backups
- **CDN**: CloudFront
- **Load Balancer**: Application Load Balancer
- **DNS**: Route 53

#### Environments
1. **Development**: Local Docker Compose
2. **Staging**: AWS staging environment
3. **Production**: AWS production environment

#### CI/CD Pipeline (GitHub Actions)
```
Code Push → GitHub
    ↓
Run Tests (Unit, Integration)
    ↓
Build Docker Images
    ↓
Push to Container Registry
    ↓
Deploy to Staging
    ↓
Run E2E Tests
    ↓
Manual Approval
    ↓
Deploy to Production
    ↓
Health Checks
```

### Monitoring & Logging
- **APM**: New Relic or DataDog
- **Logs**: CloudWatch Logs or Elasticsearch
- **Errors**: Sentry
- **Uptime**: StatusPage or Pingdom
- **Metrics**: CloudWatch or Prometheus

### Backup Strategy
- **Database**: Automated daily backups, 30-day retention
- **Documents**: S3 versioning enabled
- **Point-in-Time Recovery**: Enabled for critical data
- **Disaster Recovery**: Multi-region replication (optional)

---

## Migration Strategy

### Phase 1: Data Assessment
1. **Inventory Current Data**
   - Excel workbooks
   - CSV files
   - Existing financial software exports

2. **Data Quality Analysis**
   - Identify duplicates
   - Check for missing data
   - Validate formats
   - Assess completeness

3. **Mapping Exercise**
   - Map Excel columns to database fields
   - Identify transformation rules
   - Document exceptions

### Phase 2: Data Extraction
1. **Export from Source Systems**
   - Save Excel sheets as CSV
   - Export from current software
   - Gather historical statements

2. **Standardize Formats**
   - Convert dates to ISO 8601
   - Standardize currency formatting
   - Normalize account names
   - Consistent transaction types

### Phase 3: Data Transformation
1. **Clean and Validate**
   - Remove duplicates
   - Fill missing values
   - Correct errors
   - Validate against business rules

2. **Transform Structure**
   - Split denormalized data
   - Create relationships (foreign keys)
   - Generate IDs
   - Calculate derived values

3. **Enrich Data**
   - Fetch current prices
   - Calculate unrealized gains
   - Determine tax lots
   - Add metadata

### Phase 4: Data Loading
1. **Database Setup**
   - Create tables
   - Set up constraints
   - Create indexes
   - Configure permissions

2. **Initial Load**
   - Load users
   - Load accounts
   - Load investment types
   - Load positions
   - Load transactions (historical → recent)
   - Load properties
   - Load entities/farms

3. **Validation**
   - Verify record counts
   - Check data integrity
   - Validate calculations
   - Test relationships

### Phase 5: Migration Cutover
1. **Parallel Run**
   - Use both old and new systems
   - Compare outputs
   - Identify discrepancies
   - Refine migration scripts

2. **Final Cutover**
   - Set cutover date
   - Final data sync
   - Switch to new system
   - Archive old system

3. **Post-Migration**
   - Monitor closely
   - Provide user support
   - Document issues
   - Make adjustments

### Migration Tools
- **Custom Scripts**: Python/TypeScript for transformation
- **Database Tools**: pg_dump, pg_restore
- **ETL Tools**: Airbyte, Fivetran (if needed)
- **Validation**: SQL queries, custom reports

### Migration Checklist
- [ ] Backup all source data
- [ ] Document current state
- [ ] Create test database
- [ ] Develop migration scripts
- [ ] Test migration on sample data
- [ ] Validate test results
- [ ] Create rollback plan
- [ ] Schedule migration window
- [ ] Execute migration
- [ ] Validate production data
- [ ] Train users on new system
- [ ] Monitor for issues
- [ ] Archive old system

### Rollback Plan
If migration fails:
1. Stop all writes to new system
2. Restore database from backup
3. Point users back to old system
4. Analyze failure
5. Fix issues
6. Reschedule migration

---

## Scalability Considerations

### Horizontal Scaling
- **API Servers**: Stateless, can scale to multiple instances
- **Workers**: Scale job processors independently
- **Database**: Read replicas for query scaling

### Vertical Scaling
- **Database**: Upgrade instance size as data grows
- **Cache**: Increase Redis memory

### Performance Optimization
- **Query Optimization**: Use indexes, avoid N+1 queries
- **Caching Strategy**: Cache expensive calculations
- **CDN**: Serve static assets from edge locations
- **Database Connection Pooling**: Reuse connections
- **Async Processing**: Move slow tasks to background jobs

---

## Version History

- **v1.0** (Current): Initial architecture document
- Future versions will track architectural changes
