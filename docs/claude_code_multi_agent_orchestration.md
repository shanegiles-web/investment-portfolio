# Multi-Agent Orchestration Strategy for Investment Portfolio App
## Building with Claude Code in VS Code

**Version:** 1.0  
**Created:** October 21, 2025  
**Purpose:** Step-by-step guide for using Claude Code with multiple specialized agents to build the investment portfolio management application

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture of Multi-Agent System](#architecture)
3. [Agent Roles & Responsibilities](#agent-roles)
4. [Orchestrator Agent Setup](#orchestrator-setup)
5. [Phase-by-Phase Implementation](#implementation)
6. [Agent Communication Protocols](#communication)
7. [Quality Control System](#quality-control)
8. [VS Code Setup & Configuration](#vscode-setup)
9. [Daily Workflow](#workflow)
10. [Troubleshooting](#troubleshooting)

---

## 1. Overview {#overview}

### What We're Building

A multi-agent system where:
- **1 Orchestrator Agent** manages the overall project, delegates tasks, and ensures alignment with specifications
- **5-7 Specialized Feature Agents** each build specific modules (accounts, transactions, properties, etc.)
- **1 QA Agent** performs continuous testing, code review, and quality assurance
- **1 Documentation Agent** maintains up-to-date docs, API specs, and user guides

### Why This Approach?

- **Parallel Development**: Multiple features developed simultaneously
- **Specialization**: Each agent becomes expert in their domain
- **Quality Focus**: Dedicated QA agent catches issues early
- **Consistency**: Orchestrator ensures adherence to design system and architecture
- **Efficiency**: Faster development than single-agent approach

---

## 2. Architecture of Multi-Agent System {#architecture}

```
┌─────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR AGENT                        │
│  - Reads all specification documents                        │
│  - Creates work breakdown structure                         │
│  - Delegates tasks to specialized agents                    │
│  - Monitors progress and dependencies                       │
│  - Enforces design system and architecture                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────┬─────────────────┬─────────────────┐
                            │                 │                 │                 │
                            ▼                 ▼                 ▼                 ▼
            ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
            │  FEATURE AGENTS   │ │  FEATURE AGENTS   │ │  FEATURE AGENTS   │ │  FEATURE AGENTS   │
            │                   │ │                   │ │                   │ │                   │
            │ - Auth Agent      │ │ - Positions Agent │ │ - Properties Agent│ │ - Reports Agent   │
            │ - Accounts Agent  │ │ - Transactions Agt│ │ - Farm Agent      │ │ - Rebalancing Agt │
            │                   │ │                   │ │                   │ │                   │
            └───────────────────┘ └───────────────────┘ └───────────────────┘ └───────────────────┘
                            │                 │                 │                 │
                            └─────────────────┴─────────────────┴─────────────────┘
                                              │
                                              ▼
                            ┌─────────────────────────────────┐
                            │         QA AGENT                │
                            │  - Reviews all code             │
                            │  - Runs automated tests         │
                            │  - Validates against specs      │
                            │  - Reports issues               │
                            │  - Suggests improvements        │
                            └─────────────────────────────────┘
                                              │
                                              ▼
                            ┌─────────────────────────────────┐
                            │    DOCUMENTATION AGENT          │
                            │  - Updates API docs             │
                            │  - Writes user guides           │
                            │  - Maintains README files       │
                            │  - Creates tutorials            │
                            └─────────────────────────────────┘
```

---

## 3. Agent Roles & Responsibilities {#agent-roles}

### 3.1 Orchestrator Agent (Primary)

**Purpose:** Master coordinator that oversees entire project

**Responsibilities:**
- Read and internalize ALL project documents (README, specs, database schema, design system, architecture)
- Create detailed work breakdown structure (WBS)
- Assign tasks to specialized agents
- Monitor dependencies between features
- Enforce design system consistency
- Resolve conflicts between agents
- Generate daily status reports
- Maintain project timeline

**Key Files to Reference:**
- `/project/README.md`
- `/project/investment_app_specification.md`
- `/project/database_schema.sql`
- `/project/design_system.md`
- `/project/architecture_and_migration.md`
- `/project/quick_start_guide.md`

**Session Prompt:**
```
You are the Orchestrator Agent for building the Investment Portfolio Management App.

Your primary responsibilities:
1. Read and understand all project documentation in /project/
2. Break down the project into manageable tasks
3. Delegate tasks to specialized feature agents
4. Ensure all work follows the design system in design_system.md
5. Monitor progress and dependencies
6. Coordinate with QA Agent for quality assurance
7. Generate daily progress reports

Current Phase: [Phase 1 - Foundation & MVP]
Focus Areas: [Authentication, Account Management, Position Tracking]

Before delegating any task:
- Verify it aligns with the specification
- Check database schema for required tables
- Ensure design system compliance
- Identify dependencies
- Set clear acceptance criteria
```

---

### 3.2 Feature Agents (Specialized)

Each feature agent is an expert in their specific domain.

#### **Agent 1: Authentication & User Agent**

**Domain:** User management, authentication, authorization

**Tasks:**
- User registration and login
- JWT token management
- Password reset flow
- MFA implementation
- Session management
- User preferences

**Key References:**
- Database: `users`, `user_sessions`, `user_preferences` tables
- Design: Form components, modal patterns
- Security: JWT, bcrypt, rate limiting

**Session Prompt:**
```
You are the Authentication & User Agent.

Your expertise: User authentication, authorization, and session management.

Reference documents:
- /project/database_schema.sql (users, user_sessions tables)
- /project/design_system.md (form components, modals)
- /project/investment_app_specification.md (Section 2.5 - Security)

Your current task: [Specific task from Orchestrator]

Requirements:
- Implement JWT authentication
- Follow design system for all UI components
- Write comprehensive tests
- Document all API endpoints
- Implement rate limiting
- Follow security best practices

Report to Orchestrator when complete with:
- Completed features
- Test coverage
- Known issues
- Next dependencies
```

#### **Agent 2: Accounts Agent**

**Domain:** Investment account management

**Tasks:**
- Create/edit/delete accounts
- Account hierarchy (parent/child)
- Account types (brokerage, 401k, IRA, etc.)
- Account metadata management
- Account grouping

**Key References:**
- Database: `accounts` table
- Design: Account summary cards, forms
- Spec: Section 1.2 - Account Management

**Session Prompt:**
```
You are the Accounts Agent.

Your expertise: Investment account management and hierarchy.

Reference documents:
- /project/database_schema.sql (accounts table)
- /project/design_system.md (Account Summary Card component)
- /project/investment_app_specification.md (Section 1.2)

Your current task: [Specific task from Orchestrator]

Requirements:
- Support all account types defined in spec
- Implement account hierarchy
- Follow design system for UI
- Write tests for all CRUD operations
- Implement proper validation

Account types to support:
- Brokerage, 401k, IRA (Traditional/Roth), HSA, 529, etc.
```

#### **Agent 3: Positions Agent**

**Domain:** Investment position tracking and calculations

**Tasks:**
- Position CRUD operations
- Cost basis calculations
- Current value calculations
- Unrealized gain/loss tracking
- Position performance metrics
- Investment type management

**Key References:**
- Database: `positions`, `investment_types` tables
- Design: Position cards, position tables
- Spec: Section 1.1 & 1.6 - Investment Types & Performance

**Session Prompt:**
```
You are the Positions Agent.

Your expertise: Investment position tracking and performance calculations.

Reference documents:
- /project/database_schema.sql (positions, investment_types)
- /project/design_system.md (Position Card, data tables)
- /project/investment_app_specification.md (Sections 1.1, 1.6)

Your current task: [Specific task from Orchestrator]

Requirements:
- Accurate cost basis calculations
- Real-time value updates
- Support for all investment types
- Proper handling of fractional shares
- Performance metric calculations (TWR, IRR)

Critical calculations:
- Unrealized gain/loss = Current Value - Cost Basis
- % Gain/Loss = (Unrealized / Cost Basis) * 100
```

#### **Agent 4: Transactions Agent**

**Domain:** Transaction management and processing

**Tasks:**
- Transaction CRUD operations
- Transaction types (buy, sell, dividend, etc.)
- Tax lot tracking
- Transaction reconciliation
- CSV import functionality
- Corporate actions

**Key References:**
- Database: `transactions`, `tax_lots` tables
- Design: Transaction list items, forms
- Spec: Section 1.3 - Transaction Management

**Session Prompt:**
```
You are the Transactions Agent.

Your expertise: Transaction processing and tax lot tracking.

Reference documents:
- /project/database_schema.sql (transactions, tax_lots)
- /project/design_system.md (Transaction List Item, forms)
- /project/investment_app_specification.md (Section 1.3)

Your current task: [Specific task from Orchestrator]

Requirements:
- Support all transaction types
- Implement tax lot tracking (FIFO, LIFO, Specific ID)
- CSV bulk import with validation
- Proper position updates after transactions
- Transaction reconciliation

Transaction types:
- Buy, Sell, Dividend, Reinvest, Transfer, Contribution, Withdrawal
```

#### **Agent 5: Properties Agent**

**Domain:** Real estate and property management

**Tasks:**
- Property CRUD operations
- Lease management
- Tenant tracking
- Cash flow analysis
- Property transaction tracking
- Cap rate calculations

**Key References:**
- Database: `properties`, `leases`, `property_transactions` tables
- Design: Property cards, cash flow components
- Spec: Section 1.4 - Real Estate Management

**Session Prompt:**
```
You are the Properties Agent.

Your expertise: Real estate property management and cash flow analysis.

Reference documents:
- /project/database_schema.sql (properties, leases, property_transactions)
- /project/design_system.md (Property Card component)
- /project/investment_app_specification.md (Section 1.4)

Your current task: [Specific task from Orchestrator]

Requirements:
- Property portfolio management
- Lease and tenant tracking
- Cash flow scenario modeling
- Expense categorization
- Cap rate and ROI calculations

Calculations required:
- Cap Rate = (Net Operating Income / Property Value) * 100
- Cash-on-Cash Return = (Annual Cash Flow / Cash Invested) * 100
```

#### **Agent 6: Farm Operations Agent**

**Domain:** Agricultural business tracking

**Tasks:**
- Farm operation management
- Farm transaction tracking
- Livestock/crop tracking
- Schedule F data preparation
- Multi-series support

**Key References:**
- Database: `farm_operations`, `farm_transactions`, `entities` tables
- Design: Form components for farm data
- Spec: Section 1.5 - Farm & Agricultural Management

#### **Agent 7: Reports & Analytics Agent**

**Domain:** Reporting, dashboards, and analytics

**Tasks:**
- Financial reports (Income Statement, Balance Sheet, Cash Flow)
- Performance reports
- Tax reports
- Custom report builder
- Dashboard components
- Data visualization

**Key References:**
- Database: Views and materialized views
- Design: Chart components, dashboard layout
- Spec: Section 1.9 - Reporting & Dashboards

#### **Agent 8: Rebalancing Agent**

**Domain:** Portfolio rebalancing tools

**Tasks:**
- Target allocation management
- Current vs target analysis
- Rebalancing recommendations
- Tax-efficient strategies
- What-if scenarios

**Key References:**
- Database: `rebalancing_targets`, `rebalancing_history` tables
- Design: Rebalancing UI patterns
- Spec: Section 1.8 - Rebalancing Tools

---

### 3.3 QA Agent (Quality Assurance)

**Purpose:** Continuous testing, code review, and quality enforcement

**Responsibilities:**
- Review all code from feature agents
- Run automated test suites
- Validate against specifications
- Check design system compliance
- Performance testing
- Security audit
- Report bugs to Orchestrator
- Suggest improvements

**Session Prompt:**
```
You are the QA Agent for the Investment Portfolio App.

Your responsibilities:
1. Review all code submitted by feature agents
2. Run automated tests (unit, integration, E2E)
3. Validate against specifications in /project/
4. Check design system compliance
5. Test edge cases and error handling
6. Security vulnerability scanning
7. Performance testing
8. Report issues with severity levels

Quality Standards:
- 90%+ test coverage
- All tests passing
- No critical security vulnerabilities
- Design system compliance
- API response time < 500ms
- Proper error handling
- Clean, documented code

When reviewing code:
1. Check functionality matches spec
2. Verify database schema usage
3. Ensure design system compliance
4. Review test coverage
5. Check for security issues
6. Validate error handling
7. Assess performance

Report Format:
- Feature: [Feature Name]
- Agent: [Agent Name]
- Status: PASS/FAIL/NEEDS_WORK
- Test Coverage: [%]
- Issues Found: [List]
- Recommendations: [List]
```

---

### 3.4 Documentation Agent

**Purpose:** Maintain comprehensive, up-to-date documentation

**Responsibilities:**
- API documentation (OpenAPI/Swagger)
- User guides
- Developer documentation
- README updates
- Code comments
- Tutorial creation
- Changelog maintenance

**Session Prompt:**
```
You are the Documentation Agent.

Your responsibilities:
1. Maintain API documentation (Swagger/OpenAPI)
2. Write user guides for each feature
3. Update developer documentation
4. Create tutorials and examples
5. Keep README files current
6. Document all configuration options
7. Maintain changelog

Documentation Standards:
- Clear, concise language
- Code examples for all features
- Screenshots where helpful
- Up-to-date with latest changes
- Searchable and well-organized

Focus Areas:
- API endpoints and parameters
- Frontend component usage
- Database schema explanation
- Setup and configuration
- Common tasks and workflows
```

---

## 4. Orchestrator Agent Setup {#orchestrator-setup}

### Step 1: Initialize Project

Create a master orchestration document that the Orchestrator uses:

**File:** `PROJECT_ORCHESTRATION.md`

```markdown
# Investment Portfolio App - Orchestration Plan

## Project Overview
Building comprehensive investment portfolio management application.

## Documentation References
- Specification: /project/investment_app_specification.md
- Database: /project/database_schema.sql
- Design: /project/design_system.md
- Architecture: /project/architecture_and_migration.md
- Setup: /project/quick_start_guide.md

## Current Phase: Phase 1 - Foundation & MVP (Months 1-3)

## Work Breakdown Structure

### Sprint 1 (Weeks 1-2): Project Setup & Authentication
- [x] Initialize repository
- [x] Set up database
- [x] Configure development environment
- [ ] Task #1: User Registration (Auth Agent)
- [ ] Task #2: User Login (Auth Agent)
- [ ] Task #3: JWT Implementation (Auth Agent)
- QA: Auth Agent code review

### Sprint 2 (Weeks 3-4): Account Management
- [ ] Task #4: Account CRUD (Accounts Agent)
- [ ] Task #5: Account Types Support (Accounts Agent)
- [ ] Task #6: Account Hierarchy (Accounts Agent)
- QA: Accounts Agent code review

### Sprint 3 (Weeks 5-6): Position Tracking
- [ ] Task #7: Investment Types (Positions Agent)
- [ ] Task #8: Position CRUD (Positions Agent)
- [ ] Task #9: Cost Basis Calculations (Positions Agent)
- QA: Positions Agent code review

[Continue for all sprints...]

## Agent Assignments

### Auth Agent
- Current Task: User Registration
- Status: In Progress
- Blockers: None
- Expected Completion: End of Week 1

### Accounts Agent
- Current Task: Waiting for Auth completion
- Status: Standby
- Dependencies: Auth Agent Task #1-3

[Continue for all agents...]

## Daily Standup Notes

### October 21, 2025
- Auth Agent: Completed user schema, working on registration endpoint
- QA Agent: Reviewed database schema, no issues found
- Blockers: None

## Issues & Risks
1. [MEDIUM] Database connection pooling needs configuration
2. [LOW] Design system color variables not yet imported

## Decisions Log
- October 21: Decided on Node.js + Express for backend
- October 21: Selected shadcn/ui for component library
```

### Step 2: Create Agent Session Templates

For each agent session in Claude Code, create a `.claude_code/agent_prompts/` directory:

**Example:** `.claude_code/agent_prompts/orchestrator.md`

```markdown
# Orchestrator Agent - Session Instructions

You are the Orchestrator Agent for the Investment Portfolio Management App.

## Your Role
Master coordinator overseeing all development activities.

## Project Context
- Current Phase: Phase 1 - Foundation & MVP
- Timeline: 12-month project, currently in Month 1
- Team: 8 specialized agents under your coordination

## Always Reference
- `/project/investment_app_specification.md` - What to build
- `/project/database_schema.sql` - Data structure
- `/project/design_system.md` - How it should look
- `/project/architecture_and_migration.md` - System architecture
- `/PROJECT_ORCHESTRATION.md` - Current status and tasks

## Daily Workflow
1. Review PROJECT_ORCHESTRATION.md
2. Check status of all active agents
3. Assign new tasks based on dependencies
4. Review QA Agent reports
5. Update orchestration document
6. Delegate next tasks

## Task Delegation Process
When delegating a task:
1. Specify the agent (e.g., "Auth Agent")
2. Define clear requirements
3. Reference relevant docs
4. Set acceptance criteria
5. Identify dependencies
6. Set deadline

## Response Format
Always structure responses as:
- Status Update
- Completed Tasks
- Active Tasks
- Blockers
- Next Actions
- Agent Instructions
```

---

## 5. Phase-by-Phase Implementation {#implementation}

### Phase 1: Foundation & MVP (Months 1-3)

#### Month 1: Setup & Authentication

**Week 1-2: Project Initialization**

**Orchestrator Instructions:**
```
Phase 1, Sprint 1: Project Setup & Authentication

Tasks to delegate:

1. To Auth Agent:
   "Set up user authentication system
   - Reference: database_schema.sql (users, user_sessions tables)
   - Reference: design_system.md (form components)
   - Implement user registration with validation
   - Implement login with JWT
   - Create middleware for protected routes
   - Follow security best practices from spec Section 2.5
   - Target: 95%+ test coverage
   
   Acceptance Criteria:
   - User can register with email/password
   - User can login and receive JWT token
   - Protected routes require valid token
   - All tests passing
   - Code reviewed by QA Agent"

2. To QA Agent:
   "Review Auth Agent code when ready
   - Verify security best practices
   - Test authentication flows
   - Check error handling
   - Validate against specification
   - Report findings to Orchestrator"
```

**Auth Agent Session:**
```bash
# In VS Code terminal
claude-code

# Then in Claude Code:
"I am the Auth Agent. Starting Task #1: User Registration.

Reference documents:
- /project/database_schema.sql
- /project/design_system.md
- /project/investment_app_specification.md

Creating user registration endpoint with:
- Email/password validation
- Bcrypt password hashing
- Database insertion
- Error handling

Starting implementation..."
```

**Week 3-4: Account Management**

**Orchestrator Instructions:**
```
Phase 1, Sprint 2: Account Management

Prerequisites: Auth system complete ✓

Tasks to delegate:

1. To Accounts Agent:
   "Build account management system
   - Reference: database_schema.sql (accounts table)
   - Reference: design_system.md (Account Summary Card)
   - Reference: spec Section 1.2
   
   Features:
   - Create/Read/Update/Delete accounts
   - Support all account types (brokerage, 401k, IRA, etc.)
   - Implement account hierarchy (parent/child)
   - Account metadata management
   
   API Endpoints:
   - POST /api/accounts (create)
   - GET /api/accounts (list)
   - GET /api/accounts/:id (get one)
   - PUT /api/accounts/:id (update)
   - DELETE /api/accounts/:id (soft delete)
   
   Acceptance Criteria:
   - All CRUD operations working
   - Support for 10+ account types
   - Parent/child hierarchy functional
   - UI follows design system
   - 90%+ test coverage"

2. To Documentation Agent:
   "Document account management API
   - OpenAPI/Swagger spec
   - Request/response examples
   - Error codes documentation
   - User guide for creating accounts"
```

#### Month 2: Position Tracking & Transactions

**Week 5-6: Position Management**

**Orchestrator Instructions:**
```
Phase 1, Sprint 3: Position Tracking

Prerequisites: 
- Auth system complete ✓
- Account management complete ✓

Tasks to delegate:

1. To Positions Agent:
   "Build position tracking system
   - Reference: database_schema.sql (positions, investment_types)
   - Reference: design_system.md (Position Card, data tables)
   - Reference: spec Sections 1.1, 1.6
   
   Core Features:
   - Position CRUD operations
   - Investment type management (stocks, bonds, ETFs, etc.)
   - Cost basis calculations
   - Current value updates
   - Unrealized gain/loss calculations
   - Performance metrics
   
   Critical Calculations:
   current_value = shares × current_price
   unrealized_gain_loss = current_value - cost_basis_total
   gain_loss_percent = (unrealized_gain_loss / cost_basis_total) × 100
   
   Database Triggers:
   - Auto-calculate values on insert/update
   - Maintain position history
   
   API Endpoints:
   - POST /api/positions
   - GET /api/accounts/:accountId/positions
   - GET /api/positions/:id
   - PUT /api/positions/:id
   - DELETE /api/positions/:id
   
   Acceptance Criteria:
   - All calculations accurate
   - Support for fractional shares
   - Real-time value updates
   - Position history tracking
   - UI matches design system
   - 95%+ test coverage"
```

**Week 7-8: Transaction Management**

**Orchestrator to Transactions Agent:**
```
Phase 1, Sprint 4: Transaction Processing

Prerequisites:
- Positions system complete ✓

Tasks:

"Build transaction management system
- Reference: database_schema.sql (transactions, tax_lots)
- Reference: design_system.md (Transaction List Item, forms)
- Reference: spec Section 1.3

Transaction Types to Support:
- Buy (increases position)
- Sell (decreases position)
- Dividend (income, no position change)
- Reinvest (dividend → buy more shares)
- Transfer In/Out (between accounts)
- Contribution (cash in)
- Withdrawal (cash out)
- Split (adjust shares and price)

Core Features:
- Transaction CRUD with validation
- Automatic position updates
- Tax lot creation and tracking (FIFO, LIFO, Specific ID)
- Transaction reconciliation
- CSV bulk import

Critical Logic:
On BUY transaction:
  - Create tax lot (acquisition date, shares, cost basis)
  - Update position: shares += transaction.shares
  - Update position: cost_basis_total += transaction.amount
  
On SELL transaction:
  - Apply cost basis method (FIFO/LIFO/Specific ID)
  - Update tax lots (reduce shares_remaining)
  - Calculate realized gain/loss
  - Update position: shares -= transaction.shares

API Endpoints:
- POST /api/transactions
- POST /api/transactions/bulk (CSV import)
- GET /api/transactions
- GET /api/transactions/:id
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
- POST /api/transactions/reconcile

Acceptance Criteria:
- All transaction types working
- Accurate position updates
- Tax lot tracking functional
- CSV import with validation
- Proper error handling
- 90%+ test coverage"
```

#### Month 3: Basic Reporting

**Week 9-10: Dashboard & Reports**

**Orchestrator to Reports Agent:**
```
Phase 1, Sprint 5: Dashboard & Basic Reports

Prerequisites:
- Positions and transactions complete ✓

Tasks:

"Build dashboard and basic reporting
- Reference: design_system.md (Dashboard Layout, Metric Cards)
- Reference: spec Section 1.9

Dashboard Components:
1. Net Worth Card
   - Total portfolio value across all accounts
   - Change from last month (% and $)
   - Trend indicator (up/down arrow)

2. Asset Allocation Chart
   - Pie chart of asset classes
   - Use colors from design system
   - Show percentages
   
3. Performance Graph
   - Line chart: Portfolio value over time
   - Include S&P 500 benchmark
   - Time period selector (YTD, 1Y, 3Y, 5Y, All)

4. Recent Transactions
   - Last 10 transactions
   - Formatted according to design system

Reports to Build:
1. Portfolio Summary
   - All positions with current values
   - Grouped by account
   - Total values and gains/losses

2. Position Detail Report
   - Individual position breakdown
   - Purchase history
   - Performance metrics

3. Account Performance
   - Performance by account
   - Time-weighted return
   - Benchmarked against indexes

Data Queries:
- Use materialized views for performance
- Implement caching for dashboard data
- Optimize for <2 second load time

Acceptance Criteria:
- Dashboard loads in <2 seconds
- All charts rendering correctly
- Reports accurate and match design
- Export to PDF/Excel functional
- Mobile responsive
- 85%+ test coverage"
```

---

### Phase 2: Advanced Features (Months 4-6)

#### Month 4: Price Updates & Analytics

**Orchestrator Instructions:**
```
Phase 2, Sprint 1: Automated Price Updates

Create new specialized agent: Price Service Agent

To Price Service Agent:
"Build automated price update system
- Reference: spec Section 1.7 - Automated Data Integration

Features:
- Integration with Yahoo Finance API
- Integration with Alpha Vantage API
- Scheduled daily price updates (6 PM)
- Manual price update trigger
- Price history storage
- Corporate action handling (splits, mergers)

Background Worker:
- Use node-cron or Bull queue
- Update all positions' current prices
- Recalculate position values
- Store historical prices
- Handle API rate limits
- Retry logic for failures
- Error notification

API Endpoints:
- POST /api/prices/update (manual trigger)
- GET /api/prices/:symbol/history
- POST /api/prices/manual (manual price entry)

Acceptance Criteria:
- Scheduled updates working
- All major symbols supported
- Graceful error handling
- Price history maintained
- Corporate actions handled
- 90%+ reliability"
```

#### Month 5: CSV Import & Broker Integrations

**Orchestrator to Transactions Agent:**
```
Phase 2, Sprint 2: Enhanced Import System

Enhance transaction import capabilities:

CSV Import Features:
- Template generator
- Column mapping wizard
- Data validation
- Preview before import
- Duplicate detection
- Error reporting with line numbers

Broker-Specific Templates:
- Vanguard CSV format
- Fidelity CSV format
- Schwab CSV format
- Generic template

Import Process:
1. Upload CSV
2. Detect format (or let user select)
3. Map columns to database fields
4. Validate data (types, required fields, references)
5. Show preview with warnings
6. User confirms
7. Bulk insert with transaction
8. Report success/failures

Acceptance Criteria:
- Support 3+ broker formats
- 99%+ import success rate
- Clear error messages
- Rollback on critical errors
- Import history tracking"
```

---

### Phase 3: Real Estate & Business (Months 7-8)

**Orchestrator to Properties Agent:**
```
Phase 3: Real Estate Module

Build complete property management system:
- Reference: spec Section 1.4
- Reference: database_schema.sql (properties, leases, property_transactions)

Full feature set from specification.
Target: 4 weeks for completion.
```

---

## 6. Agent Communication Protocols {#communication}

### Daily Standup Format

Every agent reports to Orchestrator daily:

```
Agent: [Agent Name]
Date: [YYYY-MM-DD]

Yesterday:
- Completed: [Tasks completed]
- Code committed: [Yes/No]
- Tests written: [Yes/No]

Today:
- Working on: [Current task]
- Expected completion: [Date]

Blockers:
- [List any blockers or dependencies]

Requests:
- [Any questions or requests for Orchestrator]
```

### Task Handoff Protocol

When one agent's work depends on another:

```
From: Transactions Agent
To: Orchestrator
Re: Dependency on Positions Agent

Status: Waiting
Reason: Need position update API to be complete before implementing transaction processing
Estimated Impact: 2 days delay
Request: Priority on Positions Agent Task #9
```

### Code Review Request

```
From: Auth Agent
To: QA Agent
CC: Orchestrator

Task: User Authentication System
Branch: feature/auth-system
Files Changed: 12
Test Coverage: 96%
Ready For Review: Yes

Key Areas to Review:
1. JWT implementation (auth.service.js)
2. Password hashing (crypto.utils.js)
3. Rate limiting (auth.middleware.js)
4. Security headers (server.js)

Known Issues: None
Documentation: Updated in docs/api/auth.md
```

---

## 7. Quality Control System {#quality-control}

### QA Agent Review Checklist

For every feature submission:

```markdown
# QA Review Checklist

## Feature: [Feature Name]
## Agent: [Agent Name]
## Date: [Review Date]

### 1. Functionality
- [ ] Meets all requirements in specification
- [ ] All acceptance criteria met
- [ ] Edge cases handled
- [ ] Error handling implemented

### 2. Code Quality
- [ ] Clean, readable code
- [ ] Proper naming conventions
- [ ] No code smells
- [ ] DRY principle followed
- [ ] Proper comments where needed

### 3. Testing
- [ ] Unit tests present
- [ ] Integration tests present
- [ ] Test coverage ≥ 90%
- [ ] All tests passing
- [ ] Edge cases tested

### 4. Design System Compliance
- [ ] Colors match design system
- [ ] Typography correct
- [ ] Components use correct patterns
- [ ] Spacing consistent
- [ ] Responsive design works

### 5. Database
- [ ] Schema used correctly
- [ ] Queries optimized
- [ ] Indexes utilized
- [ ] Transactions used where needed
- [ ] No N+1 queries

### 6. Security
- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication/authorization correct

### 7. Performance
- [ ] API response time < 500ms
- [ ] Database queries efficient
- [ ] Proper caching implemented
- [ ] No memory leaks
- [ ] Bundle size reasonable

### 8. Documentation
- [ ] API documented
- [ ] Code commented
- [ ] README updated
- [ ] Examples provided

## Test Results
- Unit Tests: [PASS/FAIL] ([X] passing / [Y] total)
- Integration Tests: [PASS/FAIL] ([X] passing / [Y] total)
- E2E Tests: [PASS/FAIL] ([X] passing / [Y] total)

## Issues Found
1. [CRITICAL/HIGH/MEDIUM/LOW] - [Description]
2. [CRITICAL/HIGH/MEDIUM/LOW] - [Description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Overall Status: [APPROVED / NEEDS_WORK / REJECTED]

## Sign-off
QA Agent: [Signature]
Date: [Date]
```

### Automated Testing Strategy

**QA Agent runs these on every submission:**

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Code coverage
npm run test:coverage

# Linting
npm run lint

# Type checking (if TypeScript)
npm run type-check

# Security audit
npm audit

# Performance testing
npm run test:performance
```

---

## 8. VS Code Setup & Configuration {#vscode-setup}

### Step 1: Install Claude Code

```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Initialize in your project
cd investment-portfolio-app
claude-code init
```

### Step 2: Configure Multi-Agent Workspace

Create `.claude_code/config.json`:

```json
{
  "agents": {
    "orchestrator": {
      "role": "orchestrator",
      "context_files": [
        "/project/README.md",
        "/project/investment_app_specification.md",
        "/project/database_schema.sql",
        "/project/design_system.md",
        "/project/architecture_and_migration.md",
        "/PROJECT_ORCHESTRATION.md"
      ],
      "capabilities": [
        "task_delegation",
        "progress_tracking",
        "dependency_management"
      ]
    },
    "auth_agent": {
      "role": "feature_developer",
      "domain": "authentication",
      "context_files": [
        "/project/database_schema.sql",
        "/project/design_system.md",
        "/backend/src/services/auth/*",
        "/backend/src/models/user.js"
      ],
      "reports_to": "orchestrator"
    },
    "accounts_agent": {
      "role": "feature_developer",
      "domain": "accounts",
      "context_files": [
        "/project/database_schema.sql",
        "/project/design_system.md",
        "/backend/src/services/accounts/*",
        "/backend/src/models/account.js"
      ],
      "reports_to": "orchestrator"
    },
    "qa_agent": {
      "role": "quality_assurance",
      "context_files": [
        "/project/investment_app_specification.md",
        "/backend/src/**/*",
        "/frontend/src/**/*",
        "/tests/**/*"
      ],
      "capabilities": [
        "code_review",
        "test_execution",
        "quality_validation"
      ],
      "reports_to": "orchestrator"
    }
  },
  "workflows": {
    "feature_development": [
      "orchestrator assigns task",
      "feature agent implements",
      "feature agent writes tests",
      "qa agent reviews",
      "orchestrator approves"
    ]
  }
}
```

### Step 3: Create Agent Session Scripts

**File:** `scripts/start-orchestrator.sh`

```bash
#!/bin/bash

echo "Starting Orchestrator Agent Session..."

claude-code --agent orchestrator \
  --context /project \
  --prompt "$(cat .claude_code/agent_prompts/orchestrator.md)" \
  --workspace /workspace \
  --mode interactive
```

**File:** `scripts/start-feature-agent.sh`

```bash
#!/bin/bash

AGENT_NAME=$1

if [ -z "$AGENT_NAME" ]; then
  echo "Usage: ./start-feature-agent.sh <agent_name>"
  echo "Available agents: auth, accounts, positions, transactions, properties, farm, reports, rebalancing"
  exit 1
fi

echo "Starting $AGENT_NAME Agent Session..."

claude-code --agent ${AGENT_NAME}_agent \
  --context /project \
  --context /backend/src/${AGENT_NAME} \
  --prompt "$(cat .claude_code/agent_prompts/${AGENT_NAME}.md)" \
  --workspace /workspace \
  --mode interactive
```

### Step 4: VS Code Tasks Configuration

**File:** `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Orchestrator",
      "type": "shell",
      "command": "./scripts/start-orchestrator.sh",
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Start Auth Agent",
      "type": "shell",
      "command": "./scripts/start-feature-agent.sh auth",
      "problemMatcher": []
    },
    {
      "label": "Start Accounts Agent",
      "type": "shell",
      "command": "./scripts/start-feature-agent.sh accounts",
      "problemMatcher": []
    },
    {
      "label": "Start QA Agent",
      "type": "shell",
      "command": "./scripts/start-qa-agent.sh",
      "problemMatcher": []
    },
    {
      "label": "Run All Tests",
      "type": "npm",
      "script": "test",
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

---

## 9. Daily Workflow {#workflow}

### Morning Routine (Start of Day)

**Step 1: Start Orchestrator Session**
```bash
# Terminal 1
./scripts/start-orchestrator.sh
```

**Orchestrator Input:**
```
Good morning! I am the Orchestrator Agent starting my daily routine.

Actions:
1. Review PROJECT_ORCHESTRATION.md for current status
2. Check for overnight test results
3. Review commits from yesterday
4. Plan today's tasks
5. Generate status report

Generating status report...
```

**Orchestrator Output:**
```
Daily Status Report - October 21, 2025

COMPLETED YESTERDAY:
✓ Auth Agent: User registration endpoint
✓ Auth Agent: Login endpoint with JWT
✓ QA Agent: Reviewed auth code, approved with minor suggestions

IN PROGRESS TODAY:
→ Auth Agent: Password reset flow
→ Accounts Agent: Account CRUD operations (starting today)

BLOCKERS:
None

TASKS FOR TODAY:
1. Auth Agent: Complete password reset (Task #4)
2. Accounts Agent: Start account management (Task #5-7)
3. QA Agent: Review auth Task #4 when complete

METRICS:
- Sprint Progress: 30% complete (3/10 tasks)
- Test Coverage: 94%
- Velocity: On track

NEXT UP:
- Complete Auth module by end of week
- Begin Accounts module week 3
```

### Working Sessions (During Day)

**Step 2: Start Feature Agent Session**

```bash
# Terminal 2
./scripts/start-feature-agent.sh accounts
```

**Accounts Agent Input:**
```
I am the Accounts Agent starting work on Task #5: Account CRUD Operations.

Reference documents:
- /project/database_schema.sql (accounts table)
- /project/design_system.md (Account Summary Card, forms)
- /project/investment_app_specification.md (Section 1.2)

Task Requirements:
- Create account creation endpoint
- Support all account types
- Implement validation
- Follow design system for UI
- Write comprehensive tests

Starting implementation...

First, I'll review the accounts table schema:
```

**Accounts Agent continues working autonomously:**

```
Creating account service...
✓ Created /backend/src/services/accountService.js

Creating account controller...
✓ Created /backend/src/controllers/accountController.js

Creating API routes...
✓ Created /backend/src/routes/accounts.js

Implementing account creation:
- Input validation using Joi
- Database insertion
- Error handling
- Response formatting

Writing tests...
✓ Created /tests/unit/accountService.test.js
✓ Created /tests/integration/accounts.test.js

Running tests... All 15 tests passing ✓

Test coverage: 97%

Task #5 complete! Ready for QA review.
```

**Step 3: QA Review**

```bash
# Terminal 3
./scripts/start-qa-agent.sh
```

**QA Agent Input:**
```
I am the QA Agent. Reviewing Accounts Agent submission for Task #5.

Running quality checks:

1. Functionality Check...
   ✓ Account creation working
   ✓ All account types supported
   ✓ Validation working correctly
   ✓ Error handling proper

2. Code Quality Check...
   ✓ Clean, readable code
   ✓ Naming conventions followed
   ✓ No code smells detected
   ✓ Properly commented

3. Testing Check...
   ✓ Unit tests present (10 tests)
   ✓ Integration tests present (5 tests)
   ✓ Test coverage: 97% (exceeds 90% requirement)
   ✓ All tests passing

4. Design System Compliance...
   ✓ Form components match design
   ✓ Colors correct
   ✓ Typography correct
   ✓ Spacing consistent

5. Database Check...
   ✓ Schema used correctly
   ✓ Queries optimized
   ✓ Proper indexes used

6. Security Check...
   ✓ Input validation present
   ✓ SQL injection prevented
   ✓ Authentication required

7. Performance Check...
   ✓ API response time: 45ms (excellent)
   ✓ No N+1 queries
   ✓ Proper error handling

ISSUES FOUND: None

RECOMMENDATIONS:
1. Consider adding pagination for large account lists (future enhancement)

OVERALL STATUS: APPROVED ✓

Task #5 approved. Reporting to Orchestrator.
```

### End of Day Routine

**Orchestrator Generates EOD Report:**

```
End of Day Report - October 21, 2025

COMPLETED TODAY:
✓ Auth Agent: Password reset flow (Task #4)
✓ Accounts Agent: Account CRUD operations (Task #5)
✓ QA Agent: Approved Tasks #4 and #5

VELOCITY:
- Completed: 2 tasks (expected: 2) ✓
- Test Coverage: 95% (target: 90%) ✓
- Performance: All APIs < 100ms ✓

BLOCKERS RESOLVED:
- None

NEW BLOCKERS:
- None

TOMORROW'S PLAN:
- Accounts Agent: Account types & hierarchy (Tasks #6-7)
- Auth Agent: MFA implementation (Task #8) - Optional for MVP
- QA Agent: Continue reviews as needed

OVERALL STATUS: On Track ✓

Sprint 1 Progress: 50% complete (5/10 tasks)
Phase 1 Progress: 17% complete

Next milestone: Complete Auth & Accounts by end of Sprint 2 (Week 4)
```

---

## 10. Troubleshooting {#troubleshooting}

### Common Issues & Solutions

#### Issue 1: Agent Conflicts

**Problem:** Two agents modifying same files

**Solution:**
```
Orchestrator Action:
1. Review task assignments
2. Identify overlap
3. Reassign tasks to avoid conflicts
4. Use git branches per agent
5. Enforce merge request process

Agent Protocol:
- Each agent works in their own branch
- Branch naming: feature/{agent-name}/{task-number}
- Pull requests require Orchestrator approval
```

#### Issue 2: Agent Blockers

**Problem:** Agent waiting on dependency

**Solution:**
```
Agent Reports Blocker:
"Auth Agent blocked: Need database schema review before proceeding"

Orchestrator Action:
1. Identify dependency (Database schema)
2. Prioritize blocking task
3. Temporarily reassign agent to different task
4. Communicate timeline to blocked agent

Alternative:
- Provide mock data/API for agent to continue
- Implement interface first, details later
```

#### Issue 3: Quality Issues

**Problem:** QA Agent finds critical issues

**Solution:**
```
QA Agent Reports:
"CRITICAL: Security vulnerability in auth implementation"

Orchestrator Action:
1. Immediately halt deployment
2. Assign Auth Agent to fix
3. Mark as highest priority
4. Re-review after fix
5. Document lesson learned

Process Improvement:
- Add security checklist to agent prompts
- Require security review before QA
```

#### Issue 4: Design System Violations

**Problem:** Agent not following design system

**Solution:**
```
QA Agent Reports:
"Design system violation: Incorrect colors used"

Orchestrator Action:
1. Reject submission
2. Provide specific design system reference
3. Request revision
4. Update agent prompt with explicit design rules

Prevention:
- Add design system reference to all agent prompts
- Provide component examples
- Use design system linter
```

---

## Implementation Checklist

### Initial Setup
- [ ] Clone repository
- [ ] Install Claude Code
- [ ] Create PROJECT_ORCHESTRATION.md
- [ ] Set up agent prompt templates
- [ ] Configure .claude_code/config.json
- [ ] Create agent session scripts
- [ ] Set up VS Code tasks
- [ ] Initialize database

### Phase 1 Preparation
- [ ] Review all project documents
- [ ] Create Sprint 1 task breakdown
- [ ] Assign initial tasks
- [ ] Set up CI/CD pipeline
- [ ] Configure testing framework
- [ ] Set up code quality tools

### Agent Activation
- [ ] Start Orchestrator Agent
- [ ] Start Auth Agent
- [ ] Start QA Agent
- [ ] Begin Sprint 1
- [ ] Daily standup routine
- [ ] Weekly sprint review

### Ongoing Operations
- [ ] Daily orchestrator check-ins
- [ ] Weekly sprint reviews
- [ ] Monthly phase reviews
- [ ] Continuous QA
- [ ] Documentation updates
- [ ] Performance monitoring

---

## Success Metrics

### Development Velocity
- **Target:** 2-3 tasks completed per day per agent
- **Measure:** Tasks completed vs. planned
- **Status:** Track in PROJECT_ORCHESTRATION.md

### Quality Metrics
- **Test Coverage:** ≥90%
- **Code Review Approval Rate:** ≥95%
- **Bug Density:** <5 bugs per 1000 LOC
- **Security Vulnerabilities:** 0 critical

### Performance Metrics
- **API Response Time:** <500ms (95th percentile)
- **Page Load Time:** <2 seconds
- **Test Suite Runtime:** <5 minutes
- **Build Time:** <3 minutes

### Project Metrics
- **Sprint Completion:** ≥90% of planned tasks
- **Phase Timeline:** On schedule ±1 week
- **Budget:** Within 10% of estimate
- **Stakeholder Satisfaction:** ≥80% approval

---

## Summary

This multi-agent orchestration strategy provides:

1. **Clear Structure:** Defined roles and responsibilities
2. **Efficient Workflow:** Parallel development with coordination
3. **Quality Assurance:** Dedicated QA agent and automated testing
4. **Scalability:** Can add more specialized agents as needed
5. **Flexibility:** Can adjust based on project needs
6. **Accountability:** Each agent responsible for their domain
7. **Documentation:** Continuous documentation updates
8. **Monitoring:** Real-time progress tracking

By following this guide, you can leverage Claude Code's capabilities with multiple specialized agents to build the Investment Portfolio Management App efficiently and with high quality.

**Next Steps:**
1. Review this orchestration guide
2. Set up your VS Code environment
3. Initialize PROJECT_ORCHESTRATION.md
4. Start Orchestrator Agent
5. Begin Phase 1, Sprint 1
6. Monitor and adjust as needed

Good luck with your build! 🚀
