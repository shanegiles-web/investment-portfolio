# Investment Portfolio Management App

A comprehensive, flexible investment tracking application built using a multi-agent development approach with Claude Code.

## Overview

This application provides complete portfolio management capabilities including:
- **Investment Tracking**: Stocks, bonds, mutual funds, ETFs, alternatives, and custom investment types
- **Account Management**: Support for brokerage, retirement, education, and custom accounts
- **Real Estate**: Property management, lease tracking, cash flow analysis
- **Farm & Business**: Agricultural operations and business interest tracking
- **Advanced Analytics**: Performance metrics, rebalancing tools, tax optimization
- **Automated Data**: Price updates, broker integrations, scheduled reports

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Material-UI or shadcn/ui
- Redux Toolkit or Zustand for state management
- Recharts for data visualization
- React Hook Form with Zod validation

### Backend
- Node.js with Express.js
- PostgreSQL database
- Redis for caching
- JWT authentication
- OpenAPI/Swagger documentation

### Deployment
- Docker containers
- Cloud hosting (AWS/GCP/Azure)
- CI/CD with GitHub Actions

## Project Structure

```
investment-portfolio-app/
├── backend/              # Node.js backend application
├── frontend/             # React frontend application
├── docs/                 # Project documentation
├── tests/                # Test files
├── scripts/              # Utility scripts
├── .claude_code/         # Multi-agent orchestration
│   ├── agent_prompts/    # Agent system prompts
│   ├── sessions/         # Agent session logs
│   └── reports/          # Daily progress reports
└── PROJECT_ORCHESTRATION.md  # Master control document
```

## Development Approach

This project uses a **multi-agent development strategy** where specialized Claude Code agents work together:

- **Orchestrator Agent**: Master coordinator managing all agents
- **Setup Agent**: Environment and infrastructure
- **Auth Agent**: Authentication and user management
- **Accounts Agent**: Account management features
- **Positions Agent**: Position tracking
- **Transactions Agent**: Transaction processing
- **Properties Agent**: Real estate management
- **Farm Agent**: Agricultural operations
- **Reports Agent**: Reporting and dashboards
- **Rebalancing Agent**: Portfolio rebalancing
- **QA Agent**: Quality assurance and testing

## Implementation Phases

### Phase 1: Foundation & MVP (Months 1-3)
- Authentication system
- Account and position management
- Basic transaction processing
- Simple dashboard and reporting

### Phase 2: Advanced Features (Months 4-6)
- Real estate module
- Farm/business operations
- Advanced analytics and rebalancing
- Tax lot tracking

### Phase 3: Automation & Polish (Months 7-12)
- Automated price updates
- Broker integrations
- Document management
- Performance optimization
- Comprehensive testing and launch

## Getting Started

See `quick_start_guide.md` for setup instructions.

For the multi-agent orchestration approach, see `claude_code_multi_agent_orchestration.md`.

## Documentation

- `investment_app_specification.md` - Complete feature specification
- `database_schema.sql` - Database structure
- `design_system.md` - UI/UX guidelines
- `architecture_and_migration.md` - System architecture
- `quick_start_guide.md` - Setup and launch guide
- `claude_code_multi_agent_orchestration.md` - Multi-agent strategy

## Timeline

**Target**: 12 months to full completion
**MVP**: 3 months
**First feature**: 1-2 weeks

## License

Private / Proprietary

## Contact

For questions or issues, refer to the Orchestrator Agent.
