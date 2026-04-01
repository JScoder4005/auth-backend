# Expense Tracker Backend API

A RESTful API built with **Node.js**, **Express 5**, **TypeScript**, and **PostgreSQL** for managing personal expenses, budgets, and financial analytics.

## Features

- **Authentication** — JWT access + refresh tokens, bcrypt password hashing, cookie-based and Bearer token support
- **Expense Management** — Full CRUD, filter by category/date/type, CSV export
- **Category Management** — Custom income/expense categories
- **Budget Tracking** — Period-based budgets (daily/weekly/monthly/yearly) with real-time progress
- **Analytics** — Dashboard summary, category breakdown, monthly trends, top categories
- **Rate Limiting** — Per-IP limits on auth and expense endpoints
- **Input Validation** — Request validation middleware with descriptive errors
- **Error Handling** — Centralized `asyncHandler` + `AppError` pattern, Prisma error mapping
- **Health Monitoring** — Health check and ping endpoints

## Prerequisites

- **Node.js** v18+
- **PostgreSQL** v12+
- **pnpm** (v10+)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/expensedb"
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Running the Application

### Development Mode
```bash
pnpm dev
```

The server starts on `http://localhost:3001` by default.

## API Reference

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for the full API reference.

### Base URL
```
http://localhost:3001/api
```

### Health & Status
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health/health` | Full health check with DB status | No |
| GET | `/api/health/ping` | Simple liveness ping | No |

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive tokens | No |
| POST | `/api/auth/refresh-token` | Rotate access token using refresh token | No |
| POST | `/api/auth/logout` | Logout and invalidate refresh token | No |
| GET | `/api/auth/me` | Get current user profile + stats | Yes |
| GET | `/api/auth/users` | List all users | Yes |

### Expenses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/expenses` | Create an expense | Yes |
| GET | `/api/expenses` | List expenses (filterable) | Yes |
| GET | `/api/expenses/:id` | Get expense by ID | Yes |
| PUT | `/api/expenses/:id` | Update an expense | Yes |
| DELETE | `/api/expenses/:id` | Delete an expense | Yes |
| GET | `/api/expenses/export/csv` | Export expenses as CSV | Yes |

**Query filters for `GET /api/expenses`:** `startDate`, `endDate`, `categoryId`, `type`

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/categories` | Create a category | Yes |
| GET | `/api/categories` | List categories (filterable by `type`) | Yes |
| DELETE | `/api/categories/:id` | Delete a category (blocked if expenses exist) | Yes |

### Budgets
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/budgets` | Create a budget | Yes |
| GET | `/api/budgets` | List all budgets | Yes |
| GET | `/api/budgets/:id` | Get budget by ID | Yes |
| GET | `/api/budgets/:id/progress` | Get spending progress for a budget | Yes |
| PUT | `/api/budgets/:id` | Update a budget | Yes |
| DELETE | `/api/budgets/:id` | Delete a budget | Yes |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/summary` | Dashboard summary with totals and category breakdown | Yes |
| GET | `/api/analytics/category-breakdown` | Per-category spending (for pie charts) | Yes |
| GET | `/api/analytics/monthly-trends` | Monthly income/expense trends | Yes |
| GET | `/api/analytics/top-categories` | Top spending categories | Yes |

**Query params for `/summary` and `/category-breakdown`:** `startDate`, `endDate`, `type`
**Query params for `/monthly-trends`:** `months` (default: `6`)
**Query params for `/top-categories`:** `limit` (default: `5`), `type` (default: `expense`)

## Authentication

Two methods are supported:

**Cookie-based (default after login)**
Tokens are set automatically in `httpOnly` cookies.

**Bearer Token**
```
Authorization: Bearer <access_token>
```

Access tokens expire in **30 minutes**. Use `POST /api/auth/refresh-token` to get a new one using the refresh token cookie (valid for 7 days).

## Project Structure

```
src/
├── config/
│   └── prisma.ts          # Prisma client singleton
├── controllers/
│   ├── auth-controller.ts
│   ├── expense-controller.ts
│   ├── category-controller.ts
│   ├── budget-controller.ts
│   ├── analytics-controller.ts
│   └── health-controller.ts
├── middlewares/
│   ├── authMiddleware.ts  # JWT authentication
│   ├── validation.ts      # Request validation
│   ├── rateLimiter.ts     # In-memory rate limiting
│   └── logger.ts          # Request/response logger
├── routes/
│   ├── authroutes.ts
│   ├── expenseRoutes.ts
│   ├── categoryRoutes.ts
│   ├── budgetRoutes.ts
│   ├── analyticsRoutes.ts
│   └── healthRoutes.ts
├── utils/
│   ├── jwt.ts             # Token creation and verification
│   ├── errorHandler.ts    # asyncHandler, AppError, error middleware
│   ├── queryHelpers.ts    # Prisma select fields, date filters, pagination
│   └── responseHelpers.ts # Typed response helpers
├── app.ts                 # Express app setup (middleware + routes)
└── index.ts               # Server entry point
```

## Database Schema

Managed with **Prisma ORM**. Main models:

- **User** — user accounts
- **RefreshToken** — issued refresh tokens (one-to-many with User)
- **Expense** — expense/income records
- **Category** — user-defined categories (income or expense)
- **Budget** — period-based budget limits, optionally scoped to a category

```bash
npx prisma studio    # Open visual DB browser
```

## Error Responses

All errors follow this shape:

```json
{
  "message": "Human-readable description",
  "errors": { "field": "Specific issue" }
}
```

In `development`, a `stack` field is included on 500 errors.

## Security

- Passwords hashed with bcrypt (cost factor 10)
- `httpOnly`, `sameSite: strict` cookies
- `secure` cookie flag enabled in production
- CORS restricted to configured origins
- Rate limiting on auth (5 req / 15 min) and expense (30 req / 1 min) endpoints
- SQL injection prevention via Prisma parameterized queries

## License

MIT
