# Expense Tracker Backend API 💰

A robust RESTful API built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL** for managing personal expenses, budgets, and financial analytics.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Secure password hashing with bcrypt
  - Cookie-based and Bearer token support
  
- **Expense Management**
  - Create, read, update, and delete expenses
  - Filter expenses by category, date range
  - Export expenses to CSV
  
- **Category Management**
  - Custom expense categories
  - Category-based filtering and analytics
  
- **Budget Tracking**
  - Set and monitor budgets
  - Budget alerts and notifications
  
- **Analytics**
  - Expense trends and insights
  - Category-wise spending analysis
  
- **Input Validation**
  - Request validation middleware
  - Detailed error messages
  
- **Health Monitoring**
  - API health check endpoints
  - Database connection monitoring

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/authdb"
   JWT_ACCESS_SECRET=your_access_token_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   PORT=3000
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

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Base URL
```
http://localhost:3000/api
```

### Quick Reference

#### Health & Status
- `GET /api/health/health` - Health check
- `GET /api/health/ping` - Simple ping

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/users` - Get all users (auth required)

#### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/export/csv` - Export to CSV

#### Categories
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all categories
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Analytics
- `GET /api/analytics/summary` - Get expense summary
- `GET /api/analytics/trends` - Get spending trends

#### Budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets` - Get all budgets
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

## 🧪 Testing with Postman

1. Import the API collection (if available)
2. Set up environment variables:
   - `base_url`: `http://localhost:3000/api`
3. Start with authentication:
   - Register a user
   - Login to get tokens
   - Use tokens for protected endpoints

## 🔒 Authentication

This API supports two authentication methods:

### 1. Cookie-based (Recommended)
Tokens are automatically set in cookies after login.

### 2. Bearer Token
Include in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

## 🗄️ Database Schema

The application uses Prisma ORM with PostgreSQL. Main models:

- **User** - User accounts
- **Expense** - Expense records
- **Category** - Expense categories
- **Budget** - Budget tracking
- **RefreshToken** - Token management

### View Schema
```bash
npx prisma studio
```

## 📁 Project Structure

```
src/
├── config/          # Configuration files (Prisma, etc.)
├── controllers/     # Route controllers
├── middlewares/     # Custom middleware (auth, validation)
├── routes/          # API routes
├── utils/           # Utility functions (JWT, helpers)
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- HTTP-only cookies (configurable)
- CORS protection
- Input validation
- SQL injection prevention (Prisma ORM)

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": {
    "field": "Specific error message"
  }
}
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/health/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-04T18:30:00.000Z",
  "services": {
    "api": "operational",
    "database": "operational"
  },
  "uptime": 12345.67
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Uday

## 🙏 Acknowledgments

- Express.js
- Prisma ORM
- PostgreSQL
- TypeScript

---

**Made with ❤️ for efficient expense tracking**