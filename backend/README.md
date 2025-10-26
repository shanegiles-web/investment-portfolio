# Investment Portfolio Backend

Backend API for the Investment Portfolio Management Application.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT + bcrypt
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## Quick Start

### Prerequisites

- Node.js 20+ installed
- Docker Desktop running
- Database setup completed (see `docs/database_setup.md`)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

### Development

```bash
# Start development server (with hot-reload)
npm run dev

# Server will start on http://localhost:3001
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.ts       # Database connection
│   │   ├── auth.ts           # Auth configuration
│   │   └── app.ts            # App configuration
│   ├── controllers/          # Request handlers
│   │   ├── authController.ts
│   │   ├── accountsController.ts
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── authService.ts
│   │   ├── accountsService.ts
│   │   └── ...
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   ├── errorHandler.ts  # Error handling
│   │   └── validation.ts    # Request validation
│   ├── routes/               # API routes
│   │   ├── auth.ts
│   │   ├── accounts.ts
│   │   └── ...
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript types
│   ├── validators/           # Zod schemas
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts               # Seed script
├── tests/                    # Test files
├── .env                      # Environment variables
├── .env.example              # Environment template
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── README.md                 # This file
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=development
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user

### Account Endpoints

- `GET /api/accounts` - List all accounts
- `GET /api/accounts/:id` - Get account details
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Position Endpoints

- `GET /api/accounts/:accountId/positions` - List positions
- `GET /api/positions/:id` - Get position details
- `POST /api/positions` - Create position
- `PUT /api/positions/:id` - Update position
- `DELETE /api/positions/:id` - Delete position

### Transaction Endpoints

- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/bulk-import` - Import multiple transactions
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

For complete API documentation, see `/docs/api_documentation.md` (coming soon).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint code |
| `npm run lint:fix` | Fix linting errors |
| `npm run format` | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database |
| `npm run db:reset` | Reset database (⚠️ deletes all data) |

## Database Commands

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# View database in Prisma Studio
npm run prisma:studio

# Seed database with test data
npm run prisma:seed

# Reset database (development only!)
npm run db:reset
```

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- ESLint with recommended rules
- Prettier for code formatting
- Pre-commit hooks enforce linting

### Architecture

Follow the layered architecture pattern:

1. **Routes Layer**: HTTP request handling, input validation
2. **Controller Layer**: Orchestrate service calls
3. **Service Layer**: Business logic
4. **Data Layer**: Database operations (Prisma)

### Error Handling

```typescript
// Use custom error classes
throw new BadRequestError('Invalid input');
throw new NotFoundError('Resource not found');
throw new UnauthorizedError('Not authenticated');

// Errors are caught by error handling middleware
```

### Validation

```typescript
// Use Zod schemas for validation
import { z } from 'zod';

const CreateAccountSchema = z.object({
  accountName: z.string().min(1),
  accountType: z.string(),
  institution: z.string().optional(),
});

// Validate in controller
const data = CreateAccountSchema.parse(req.body);
```

### Testing

```typescript
// Unit tests for services
describe('AccountService', () => {
  it('should create account', async () => {
    const account = await accountService.create(data);
    expect(account).toBeDefined();
  });
});

// Integration tests for API endpoints
describe('POST /api/accounts', () => {
  it('should create account', async () => {
    const res = await request(app)
      .post('/api/accounts')
      .send(accountData)
      .expect(201);
  });
});
```

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Ensure Docker containers are running: `docker compose ps`
- Check DATABASE_URL in `.env`
- Verify PostgreSQL is healthy: `docker compose logs postgres`

**"Prisma Client not found"**
- Run: `npm run prisma:generate`

**"Migration failed"**
- Check database connection
- Review migration files in `prisma/migrations/`
- For development, try: `npm run db:reset`

**"Port 3001 already in use"**
- Change PORT in `.env`
- Or stop conflicting process

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Write code following guidelines
3. Add tests for new functionality
4. Ensure linting passes: `npm run lint`
5. Ensure tests pass: `npm test`
6. Commit changes: `git commit -m "Add new feature"`
7. Push branch: `git push origin feature/new-feature`

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

**Status**: Ready for backend development
**Last Updated**: October 23, 2025
**Maintained By**: Setup Agent
