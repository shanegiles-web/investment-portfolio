# Investment Portfolio Management App - Complete Specification

## Executive Summary
A comprehensive, flexible investment tracking application that handles multiple investment types including stocks, bonds, real estate, alternative investments, and business operations. The system will support multi-user access, automated data imports, real-time price updates, and extensive reporting capabilities.

---

## 1. CORE FEATURES & MODULES

### 1.1 Investment Type Management
**Flexible Architecture**: Dynamic investment type system allowing users to create and customize investment categories

#### Pre-configured Investment Types:
1. **Brokerage Accounts**
   - Money Market Funds
   - Mutual Funds
   - ETFs
   - Individual Stocks
   - Bonds

2. **Retirement Accounts**
   - 401(k) - Pre-tax
   - 401(k) - Post-tax (Roth)
   - Traditional IRA
   - Roth IRA
   - HSA (Health Savings Account)
   - SEP IRA
   - Simple IRA

3. **Education Accounts**
   - 529 Plans
   - Coverdell ESA

4. **Fixed Income**
   - TIPS (Treasury Inflation-Protected Securities)
   - T-Bills
   - T-Notes
   - T-Bonds
   - Corporate Bonds
   - Municipal Bonds
   - Israel Bonds (or other sovereign bonds)
   - Certificates of Deposit

5. **Alternative Investments**
   - Masterworks (Art shares)
   - Structured Products
   - Options-based ETFs
   - Commodities
   - Cryptocurrencies
   - Private Equity
   - Crowdfunding investments

6. **Real Estate**
   - Rental Properties (residential/commercial)
   - REITs
   - Real Estate Crowdfunding

7. **Business Interests**
   - LLC ownership
   - Partnership interests
   - Farm/Agricultural operations
   - Private business equity

8. **Custom Investment Types**
   - User-defined categories with custom fields
   - Flexible calculation rules
   - Custom performance metrics

### 1.2 Account Management
- Multiple account tracking
- Account hierarchies (e.g., Vanguard → Brokerage → Individual accounts)
- Account metadata: owner, tax treatment, beneficiaries
- Account grouping for reporting

### 1.3 Transaction Management
**Transaction Types:**
- Buy
- Sell
- Distribution/Dividend
- Reinvestment
- Transfer (between accounts)
- Corporate Actions (splits, mergers, spinoffs)
- Capital contributions
- Withdrawals
- Expense payments
- Income receipts

**Transaction Features:**
- Manual entry with validation
- Bulk import (CSV, Excel, API)
- Transaction linking (e.g., reinvestment → original distribution)
- Transaction categorization
- Tax lot tracking (FIFO, LIFO, Specific ID)
- Cost basis adjustment
- Reconciliation tools

### 1.4 Real Estate & Property Management

#### Property Portfolio
- Property details: address, type, purchase date, cost basis
- Deed/title information storage
- Property photos and documents
- Multiple properties per entity (LLC)

#### Lease & Tenant Management
- Tenant information
- Lease terms and renewal dates
- Rent collection tracking
- Security deposits
- Lease document storage

#### Cash Flow Analysis
- Multiple scenario modeling (A, B, C)
- Operating income calculations
- Expense tracking by category:
  - Property taxes
  - Insurance
  - Utilities
  - Maintenance
  - Property management fees
  - HOA fees
  - Mortgage payments
- Cap rate calculations
- Cash-on-cash return
- ROI calculations
- Equity buildup tracking

#### Maintenance & Repairs
- Work order system
- Vendor management
- Maintenance history log
- Scheduled maintenance reminders
- Cost tracking per property

### 1.5 Farm & Agricultural Business Management

#### Farm Operations
- Multiple farm/series tracking (Series A, B, C, etc.)
- Acreage tracking
- Crop/livestock tracking
- Cooperative memberships

#### Farm Transactions
- Sales of purchased livestock
- Cost basis of purchased livestock
- Sales of raised livestock/grain
- Cooperative distributions
- Government payments
- Crop insurance proceeds
- Operating expenses by category:
  - Seeds
  - Fertilizer
  - Chemicals
  - Feed
  - Veterinary
  - Equipment
  - Labor
  - Fuel

#### Farm Reporting
- Schedule F preparation data
- Depreciation tracking
- Section 179 deductions
- Farm income/loss by entity

### 1.6 Performance Tracking & Analytics

#### Position-Level Metrics
- Current market value
- Cost basis (average, tax lots)
- Unrealized gain/loss ($ and %)
- Realized gain/loss
- Distribution income
- Total return
- Time-weighted return
- Money-weighted return (IRR)
- Holding period

#### Account-Level Metrics
- Account balance
- Net contributions
- Account growth
- Performance vs. benchmark
- Asset allocation
- Income generation

#### Portfolio-Level Metrics
- Total net worth
- Asset allocation across all accounts
- Geographic allocation
- Sector allocation
- Market cap allocation
- Correlation analysis
- Risk metrics (Sharpe ratio, standard deviation, beta)
- Drawdown analysis

#### Benchmark Comparison
- S&P 500
- Total Stock Market
- Bond indices
- Custom benchmarks
- Multi-asset benchmarks

### 1.7 Automated Data Integration

#### Price Updates
- Real-time stock/ETF/mutual fund prices
- Bond pricing
- Alternative investment NAV updates
- Manual override capability
- Historical price storage
- Corporate action adjustments

#### Broker Integrations (API/CSV)
- Vanguard
- Fidelity
- Charles Schwab
- Interactive Brokers
- TD Ameritrade
- E*TRADE
- Generic CSV import template

#### Third-Party Data Sources
- Yahoo Finance API
- Alpha Vantage
- IEX Cloud
- Polygon.io
- Quandl
- Treasury Direct (for government bonds)

### 1.8 Rebalancing Tools

#### Target Allocation
- Asset class targets (stocks, bonds, alternatives, real estate)
- Sub-asset class targets
- Geographic allocation targets
- Sector allocation targets

#### Rebalancing Analysis
- Current vs. target deviation
- Buy/sell recommendations
- Tax-efficient rebalancing (prioritize tax-advantaged accounts)
- Cash flow rebalancing (use new contributions)
- Multiple scenario comparison

#### Rebalancing Execution
- Generate transaction list
- Fractional share support
- Trade cost estimation
- Tax impact analysis
- What-if scenarios

### 1.9 Reporting & Dashboards

#### Financial Reports
- Income Statement
  - Interest income
  - Dividend income
  - Business income (rental, farm)
  - Capital gains (realized)
  - Expenses
- Balance Sheet
  - Assets by category
  - Liabilities
  - Equity
- Cash Flow Statement
- Portfolio Activity Summary
- Tax reporting (1099, K-1 preparation)

#### Performance Reports
- Performance by account
- Performance by asset class
- Performance by time period
- Attribution analysis
- Income analysis (yield on cost, current yield)

#### Property Reports
- Property cash flow analysis
- Cap rate by property
- Occupancy rates
- Maintenance costs
- Property equity buildup

#### Dashboards
- Net worth overview
- Asset allocation pie/treemap charts
- Performance graphs (line, area, bar)
- Income tracking (monthly, annual)
- Rebalancing status
- Alerts & notifications
- Goal tracking (retirement, education, etc.)

### 1.10 Budget Management

#### Budget Categories
- Income categories
- Expense categories (housing, food, transportation, etc.)
- Savings targets
- Investment contributions

#### Budget Tracking
- Monthly budget vs. actual
- Annual budget planning
- Multi-year projections
- Category rollover
- Budget alerts

#### Cash Flow Forecasting
- Expected income
- Expected expenses
- Investment distributions
- Required minimum distributions (RMDs)
- Tax payment planning

### 1.11 Tax Planning & Reporting

#### Tax Lot Tracking
- Acquisition date
- Cost basis
- Holding period
- Wash sale tracking
- Tax-loss harvesting opportunities

#### Tax Reporting
- Capital gains (short-term, long-term)
- Dividend income (qualified, non-qualified)
- Interest income
- Business income (Schedule C, Schedule F)
- Rental income (Schedule E)
- K-1 tracking
- Foreign tax credit tracking

#### Tax Optimization
- Tax-loss harvesting recommendations
- Roth conversion analysis
- RMD calculations
- Charitable giving optimization (DAF, QCD)
- Asset location optimization

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Application Type
**Progressive Web App (PWA)** with mobile responsiveness
- Accessible via web browser
- Installable on mobile devices
- Offline capability for core features
- Native app feel

### 2.2 Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit or Zustand
- **UI Library**: Material-UI (MUI) or shadcn/ui
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack Table (React Table v8)
- **Date Handling**: date-fns or Day.js
- **API Client**: Axios or React Query

#### Backend
- **Runtime**: Node.js with Express.js OR Python with FastAPI
- **Database**: PostgreSQL (primary relational data)
- **Cache**: Redis (for performance)
- **File Storage**: AWS S3 or Azure Blob Storage (for documents)
- **Background Jobs**: Bull (Node.js) or Celery (Python)
- **API Documentation**: OpenAPI/Swagger

#### Authentication & Authorization
- **Auth Provider**: Auth0, Firebase Auth, or Supabase Auth
- **Session Management**: JWT tokens
- **Multi-factor Authentication**: TOTP, SMS
- **Role-based Access Control**: Admin, Owner, View-only

#### Data Integration
- **APIs**: REST and/or GraphQL
- **Scheduled Jobs**: Cron jobs for price updates
- **Webhooks**: For real-time broker updates
- **CSV Processing**: Papa Parse (frontend) or csv-parser (backend)

#### Deployment
- **Cloud Provider**: AWS, Google Cloud, or Azure
- **Container**: Docker
- **Orchestration**: Kubernetes or AWS ECS (for scaling)
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: DataDog, New Relic, or Sentry

### 2.3 Database Schema

#### Core Tables

**users**
- id (PK)
- email
- password_hash
- first_name
- last_name
- role
- created_at
- updated_at

**accounts**
- id (PK)
- user_id (FK)
- account_type (brokerage, 401k, ira, etc.)
- account_name
- institution
- account_number
- tax_treatment (taxable, tax_deferred, tax_exempt)
- owner
- beneficiaries (JSON)
- is_active
- created_at
- updated_at

**investment_types**
- id (PK)
- name
- category (equity, fixed_income, real_estate, alternative, business)
- is_custom
- custom_fields (JSONB)
- calculation_rules (JSONB)
- created_by (FK to users)
- created_at
- updated_at

**positions**
- id (PK)
- account_id (FK)
- investment_type_id (FK)
- symbol
- name
- shares/units
- cost_basis_total
- cost_basis_per_share
- current_price
- current_value
- unrealized_gain_loss
- last_updated
- metadata (JSONB for custom fields)

**transactions**
- id (PK)
- account_id (FK)
- position_id (FK, nullable)
- transaction_type
- transaction_date
- settlement_date
- shares/units
- price_per_share
- total_amount
- fees
- tax_lot_id (FK, nullable)
- description
- is_reconciled
- imported_from
- metadata (JSONB)
- created_at
- updated_at

**tax_lots**
- id (PK)
- position_id (FK)
- acquisition_date
- shares
- cost_basis
- disposition_date (nullable)
- holding_period_type (short_term, long_term)
- created_at
- updated_at

**prices**
- id (PK)
- symbol
- date
- open
- high
- low
- close
- volume
- adjusted_close
- source
- created_at

**properties**
- id (PK)
- user_id (FK)
- entity_id (FK to entities, nullable)
- property_type (residential, commercial, land)
- address
- city
- state
- zip
- purchase_date
- purchase_price
- current_value
- loan_balance
- bedrooms
- bathrooms
- square_feet
- lot_size
- metadata (JSONB)
- created_at
- updated_at

**leases**
- id (PK)
- property_id (FK)
- tenant_name
- tenant_contact
- start_date
- end_date
- monthly_rent
- security_deposit
- is_active
- lease_document_url
- created_at
- updated_at

**property_transactions**
- id (PK)
- property_id (FK)
- transaction_date
- category (rent, expense, maintenance, tax, insurance, etc.)
- subcategory
- amount
- description
- vendor
- receipt_url
- created_at

**entities** (for LLCs, partnerships, etc.)
- id (PK)
- user_id (FK)
- entity_type (llc, partnership, s_corp, etc.)
- entity_name
- ein
- formation_date
- ownership_percentage
- created_at
- updated_at

**farm_operations**
- id (PK)
- entity_id (FK)
- farm_name
- acreage
- crop_type
- livestock_type
- series_name (A, B, C, etc.)
- created_at
- updated_at

**budgets**
- id (PK)
- user_id (FK)
- year
- month
- category
- subcategory
- budgeted_amount
- actual_amount
- created_at
- updated_at

**rebalancing_targets**
- id (PK)
- user_id (FK)
- asset_class
- target_percentage
- min_percentage
- max_percentage
- created_at
- updated_at

**documents**
- id (PK)
- user_id (FK)
- related_entity_type (account, property, transaction, etc.)
- related_entity_id
- document_type (statement, deed, lease, tax_form, etc.)
- file_name
- file_url
- file_size
- mime_type
- upload_date

**audit_log**
- id (PK)
- user_id (FK)
- action_type
- entity_type
- entity_id
- old_value (JSON)
- new_value (JSON)
- timestamp

### 2.4 API Design

#### RESTful Endpoints

**Authentication**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- GET /api/auth/me

**Accounts**
- GET /api/accounts
- GET /api/accounts/:id
- POST /api/accounts
- PUT /api/accounts/:id
- DELETE /api/accounts/:id

**Positions**
- GET /api/accounts/:accountId/positions
- GET /api/positions/:id
- POST /api/positions
- PUT /api/positions/:id
- DELETE /api/positions/:id

**Transactions**
- GET /api/transactions
- GET /api/transactions/:id
- POST /api/transactions
- POST /api/transactions/bulk-import
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
- POST /api/transactions/reconcile

**Prices**
- GET /api/prices/:symbol
- GET /api/prices/:symbol/history?start=&end=
- POST /api/prices/update (admin/scheduled)

**Properties**
- GET /api/properties
- GET /api/properties/:id
- POST /api/properties
- PUT /api/properties/:id
- DELETE /api/properties/:id
- GET /api/properties/:id/cash-flow
- GET /api/properties/:id/transactions

**Reports**
- GET /api/reports/portfolio-summary
- GET /api/reports/performance?start=&end=&account=
- GET /api/reports/income-statement?year=
- GET /api/reports/balance-sheet?date=
- GET /api/reports/tax-summary?year=
- GET /api/reports/asset-allocation
- GET /api/reports/rebalancing

**Rebalancing**
- GET /api/rebalancing/targets
- PUT /api/rebalancing/targets
- GET /api/rebalancing/recommendations
- POST /api/rebalancing/execute

**Budgets**
- GET /api/budgets?year=&month=
- POST /api/budgets
- PUT /api/budgets/:id
- GET /api/budgets/summary?year=

### 2.5 Security & Privacy

#### Data Security
- Encryption at rest (database)
- Encryption in transit (TLS/HTTPS)
- Encrypted backups
- PII anonymization in logs
- Secure credential storage (environment variables, secrets manager)

#### Access Control
- Row-level security in database
- API rate limiting
- CORS configuration
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection

#### Compliance
- GDPR compliance (data export, deletion)
- SOC 2 considerations (audit logging)
- Financial data handling best practices

#### Backup & Recovery
- Automated daily backups
- Point-in-time recovery
- Disaster recovery plan
- Multi-region redundancy (optional)

---

## 3. USER INTERFACE DESIGN

### 3.1 Navigation Structure

**Main Navigation:**
1. Dashboard
2. Accounts
3. Positions
4. Transactions
5. Properties
6. Farms/Businesses
7. Reports
8. Rebalancing
9. Budget
10. Settings

### 3.2 Key Screens

#### Dashboard
- Net worth card
- Asset allocation chart (pie/donut)
- Performance graph (YTD, 1Y, 3Y, 5Y, All)
- Recent transactions list
- Income summary (MTD, YTD)
- Alerts & notifications
- Quick actions (add transaction, update price, etc.)

#### Accounts Page
- Account list with balances
- Filterable by account type
- Add new account button
- Account grouping toggle
- Quick view of holdings per account

#### Positions Page
- Comprehensive position table
  - Symbol, Name, Shares, Cost Basis, Current Value, Gain/Loss, %
  - Sortable, filterable, searchable
- Add position button
- Bulk actions (update prices, rebalance)
- Export functionality

#### Transactions Page
- Transaction list/table
  - Date, Account, Symbol, Type, Shares, Price, Total, Status
- Advanced filters (date range, account, type, symbol)
- Add transaction form
- Import transactions (CSV/manual)
- Reconciliation view

#### Properties Page
- Property cards/list view
- Property details page
  - Basic info, photos
  - Lease information
  - Cash flow analysis
  - Transaction history
  - Documents
- Add property form
- Property comparison view

#### Reports Page
- Report selector
- Date range picker
- Account/property filter
- Export options (PDF, Excel, CSV)
- Scheduled reports
- Report library (saved reports)

#### Settings Page
- Profile settings
- Account preferences
- Investment type customization
- Rebalancing targets
- Tax settings
- Integration settings (API keys)
- Data import/export
- User management (if multi-user)

### 3.3 Mobile Responsiveness
- Responsive design for all screen sizes
- Touch-friendly interface
- Hamburger menu on mobile
- Simplified forms on mobile
- Swipe gestures for tables
- Mobile-optimized charts

### 3.4 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Font size adjustments
- Focus indicators

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Foundation (Months 1-2)
- Database schema design and implementation
- User authentication system
- Basic account and position management
- Manual transaction entry
- Simple dashboard with net worth

### Phase 2: Core Features (Months 3-4)
- Complete transaction management
- Performance calculations
- Basic reporting (portfolio summary, positions)
- CSV import functionality
- Price update mechanism (manual and API)

### Phase 3: Advanced Features (Months 5-6)
- Real estate module (properties, leases, cash flow)
- Farm/business operations module
- Rebalancing tools
- Advanced reporting (income statement, balance sheet)
- Tax lot tracking

### Phase 4: Automation & Integration (Months 7-8)
- Automated price updates (scheduled jobs)
- Broker API integrations
- Document storage and management
- Budget management
- Email notifications

### Phase 5: Optimization & Enhancement (Months 9-10)
- Performance optimization
- Advanced analytics (Sharpe ratio, drawdown, etc.)
- Custom investment type creator
- Benchmark comparison
- Tax optimization tools
- Mobile app refinement

### Phase 6: Testing & Launch (Months 11-12)
- Comprehensive testing (unit, integration, E2E)
- Security audit
- Performance testing
- User acceptance testing
- Documentation
- Beta launch
- Production launch

---

## 5. CUSTOMIZATION & FLEXIBILITY

### 5.1 Custom Investment Types

**UI for Creating Custom Types:**
- Investment type name
- Category selection (or create new)
- Custom field definitions:
  - Field name
  - Field type (text, number, date, dropdown, etc.)
  - Required/optional
  - Default value
  - Validation rules

**Custom Calculation Builder:**
- Visual formula builder (drag-and-drop)
- Reference other fields
- Standard functions (SUM, AVERAGE, IF, etc.)
- Custom JavaScript expressions (advanced)

**Example Custom Type: "Vintage Wine Collection"**
- Fields:
  - Winery (text)
  - Vintage year (number)
  - Bottle count (number)
  - Purchase price per bottle (currency)
  - Current market price per bottle (currency)
  - Storage location (text)
  - Appraised value (currency)
- Calculations:
  - Total cost basis = Bottle count × Purchase price per bottle
  - Current value = Bottle count × Current market price per bottle
  - Gain/Loss = Current value - Total cost basis

### 5.2 Custom Reports

**Report Builder:**
- Select data sources (accounts, positions, transactions)
- Choose fields to include
- Apply filters
- Group by fields
- Aggregate functions
- Sort order
- Chart type (if applicable)
- Save as template
- Schedule automatic generation

### 5.3 Custom Dashboards

**Dashboard Widget Library:**
- Net worth
- Asset allocation
- Performance graph
- Income summary
- Recent transactions
- Property summary
- Budget summary
- Custom metric cards

**Widget Customization:**
- Size and position
- Data filters
- Refresh frequency
- Color scheme
- Click-through actions

---

## 6. DATA MIGRATION

### 6.1 Excel Import Wizard

**Step-by-step Import Process:**
1. Upload Excel file
2. Select sheet to import
3. Map columns to database fields
4. Preview import data
5. Validate data
6. Confirm and import
7. Review import log

**Supported Data Types:**
- Accounts
- Positions
- Transactions
- Properties
- Budgets
- Rebalancing targets

### 6.2 Initial Data Population

**From Your Current Workbook:**
- Parse all sheets
- Extract accounts and investment types
- Import historical transactions
- Import current positions
- Import properties and leases
- Import farm operations
- Import budgets
- Validate and reconcile

---

## 7. FUTURE ENHANCEMENTS

### Advanced Features (Post-Launch)
- AI-powered investment recommendations
- Automated tax-loss harvesting
- Portfolio stress testing
- Monte Carlo simulations for retirement planning
- Social features (compare with anonymized peers)
- Robo-advisor integration
- Cryptocurrency wallet integration
- ESG (Environmental, Social, Governance) scoring
- Carbon footprint tracking
- Estate planning tools
- Beneficiary management
- Multi-currency support
- International accounts
- Advanced risk analytics (VaR, CVaR)

---

## 8. SUCCESS METRICS

### Key Performance Indicators (KPIs)
- User adoption rate
- Daily active users (DAU)
- Transaction accuracy rate
- Data import success rate
- Average session duration
- Feature usage analytics
- User satisfaction score (NPS)
- Performance (page load time, API response time)
- Uptime (99.9% target)

---

## 9. SUPPORT & MAINTENANCE

### User Support
- In-app help documentation
- Video tutorials
- FAQ section
- Email support
- Community forum (optional)
- Feature request system

### Maintenance Plan
- Regular security patches
- Database optimization
- Performance monitoring
- Bug fix releases (bi-weekly)
- Feature releases (monthly)
- Annual security audit

---

## 10. COST ESTIMATE

### Development Costs (Rough Estimate)
- Full-stack developer: $150-200/hour × 1500-2000 hours = $225k-400k
- UI/UX designer: $100-150/hour × 200-300 hours = $20k-45k
- QA/Testing: $80-120/hour × 200-300 hours = $16k-36k
- Project management: $120-150/hour × 150-200 hours = $18k-30k
- **Total Development: $279k-511k**

### Infrastructure Costs (Annual)
- Cloud hosting: $200-500/month
- Database: $100-300/month
- Storage: $50-150/month
- API services: $100-300/month
- Monitoring/logging: $50-100/month
- **Total Infrastructure: $6k-16k/year**

### Alternative: MVP/Phased Approach
- Phase 1-2 only: $80k-150k
- Iterative development with user feedback
- Scale features based on actual usage

---

## CONCLUSION

This investment tracking app will provide a comprehensive, flexible solution that goes far beyond your current Excel workbook. The modular architecture ensures easy addition of new investment types, while the robust feature set covers everything from basic position tracking to advanced portfolio analytics, real estate management, and business operations.

The key differentiators are:
1. **Flexibility**: Easy to add new investment types without coding
2. **Automation**: Price updates, broker integrations, scheduled reports
3. **Comprehensiveness**: Handles all your investment types in one place
4. **Insights**: Advanced analytics and visualizations
5. **Accessibility**: Available on all devices with offline capability
6. **Scalability**: Grows with your portfolio

Next steps:
1. Review and approve this specification
2. Prioritize features for MVP vs. future phases
3. Select technology stack
4. Create detailed wireframes/mockups
5. Begin development

Let me know if you'd like me to dive deeper into any specific area or if you'd like to see mockups of key screens!
