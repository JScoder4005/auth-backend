# API Documentation - Expense Tracker Backend

**Base URL**: `http://localhost:3000/api`

---

## 📋 Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Expense Endpoints](#expense-endpoints)
- [Authentication Setup](#authentication-setup)

---

## 🔐 Authentication Endpoints

### 1. Register User
Create a new user account.

**Endpoint**: `POST /auth/register`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response** (201):
```json
{
  "message": "User created",
  "userId": 1
}
```

**Error Response** (400):
```json
{
  "message": "User already exists"
}
```

---

### 2. Login
Authenticate user and receive access tokens.

**Endpoint**: `POST /auth/login`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response** (200):
```json
{
  "message": "Logged in",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Cookies Set**:
- `accessToken` - Valid for 30 minutes
- `refreshToken` - Valid for 7 days

**Error Response** (400):
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Refresh Token
Get a new access token using refresh token.

**Endpoint**: `POST /auth/refresh-token`

**Headers**:
```
Cookie: refreshToken=<your_refresh_token>
```

**Request Body**: None (uses cookie)

**Success Response** (200):
```json
{
  "accessToken": "new_jwt_token_here"
}
```

**Error Response** (401):
```json
{
  "message": "No token"
}
```

---

### 4. Logout
Invalidate tokens and logout user.

**Endpoint**: `POST /auth/logout`

**Headers**:
```
Cookie: refreshToken=<your_refresh_token>
```

**Request Body**: None

**Success Response** (200):
```json
{
  "message": "Logged out"
}
```

---

### 5. Get All Users
Retrieve all registered users (requires authentication).

**Endpoint**: `GET /auth/users`

**Headers**:
```
Cookie: accessToken=<your_access_token>
```

**Request Body**: None

**Success Response** (200):
```json
{
  "users": [
    {
      "id": 1,
      "email": "user1@example.com",
      "createdAt": "2026-01-28T12:00:00.000Z",
      "updatedAt": "2026-01-28T12:00:00.000Z"
    },
    {
      "id": 2,
      "email": "user2@example.com",
      "createdAt": "2026-01-29T00:30:00.000Z",
      "updatedAt": "2026-01-29T00:30:00.000Z"
    }
  ],
  "count": 2
}
```

**Error Response** (401):
```json
{
  "message": "Access token required"
}
```

---

## 💰 Expense Endpoints

> **Note**: All expense endpoints require authentication. Include the `accessToken` cookie or Bearer token.

### 6. Create Expense
Add a new expense.

**Endpoint**: `POST /expenses`

**Headers**:
```
Content-Type: application/json
Cookie: accessToken=<your_access_token>
```

**Request Body**:
```json
{
  "amount": 150.50,
  "description": "Grocery shopping",
  "category": "Food",
  "date": "2026-01-29"
}
```

**Success Response** (201):
```json
{
  "id": 1,
  "amount": 150.50,
  "description": "Grocery shopping",
  "category": "Food",
  "date": "2026-01-29T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2026-01-29T00:33:00.000Z",
  "updatedAt": "2026-01-29T00:33:00.000Z"
}
```

---

### 7. Get All Expenses
Retrieve all expenses for the authenticated user.

**Endpoint**: `GET /expenses`

**Headers**:
```
Cookie: accessToken=<your_access_token>
```

**Query Parameters** (Optional):
- `category` - Filter by category (e.g., `?category=Food`)
- `startDate` - Filter from date (e.g., `?startDate=2026-01-01`)
- `endDate` - Filter to date (e.g., `?endDate=2026-01-31`)
- `limit` - Limit results (e.g., `?limit=10`)
- `offset` - Pagination offset (e.g., `?offset=0`)

**Example URLs**:
```
GET /expenses
GET /expenses?category=Food
GET /expenses?startDate=2026-01-01&endDate=2026-01-31
GET /expenses?category=Food&limit=5
```

**Request Body**: None

**Success Response** (200):
```json
[
  {
    "id": 1,
    "amount": 150.50,
    "description": "Grocery shopping",
    "category": "Food",
    "date": "2026-01-29T00:00:00.000Z",
    "userId": 1,
    "createdAt": "2026-01-29T00:33:00.000Z",
    "updatedAt": "2026-01-29T00:33:00.000Z"
  },
  {
    "id": 2,
    "amount": 50.00,
    "description": "Restaurant",
    "category": "Food",
    "date": "2026-01-28T00:00:00.000Z",
    "userId": 1,
    "createdAt": "2026-01-28T12:00:00.000Z",
    "updatedAt": "2026-01-28T12:00:00.000Z"
  }
]
```

---

### 8. Get Expense by ID
Retrieve a specific expense.

**Endpoint**: `GET /expenses/:id`

**Headers**:
```
Cookie: accessToken=<your_access_token>
```

**URL Parameters**:
- `id` - Expense ID (e.g., `/expenses/1`)

**Request Body**: None

**Success Response** (200):
```json
{
  "id": 1,
  "amount": 150.50,
  "description": "Grocery shopping",
  "category": "Food",
  "date": "2026-01-29T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2026-01-29T00:33:00.000Z",
  "updatedAt": "2026-01-29T00:33:00.000Z"
}
```

**Error Response** (404):
```json
{
  "message": "Expense not found"
}
```

---

### 9. Update Expense
Modify an existing expense.

**Endpoint**: `PUT /expenses/:id`

**Headers**:
```
Content-Type: application/json
Cookie: accessToken=<your_access_token>
```

**URL Parameters**:
- `id` - Expense ID (e.g., `/expenses/1`)

**Request Body** (all fields optional):
```json
{
  "amount": 200.00,
  "description": "Updated grocery shopping",
  "category": "Food & Drinks",
  "date": "2026-01-30"
}
```

**Success Response** (200):
```json
{
  "id": 1,
  "amount": 200.00,
  "description": "Updated grocery shopping",
  "category": "Food & Drinks",
  "date": "2026-01-30T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2026-01-29T00:33:00.000Z",
  "updatedAt": "2026-01-29T00:35:00.000Z"
}
```

---

### 10. Delete Expense
Remove an expense.

**Endpoint**: `DELETE /expenses/:id`

**Headers**:
```
Cookie: accessToken=<your_access_token>
```

**URL Parameters**:
- `id` - Expense ID (e.g., `/expenses/1`)

**Request Body**: None

**Success Response** (200):
```json
{
  "message": "Expense deleted successfully"
}
```

**Error Response** (404):
```json
{
  "message": "Expense not found"
}
```

---

### 11. Export Expenses to CSV
Download expenses as a CSV file.

**Endpoint**: `GET /expenses/export/csv`

**Headers**:
```
Cookie: accessToken=<your_access_token>
```

**Query Parameters** (Optional):
- `category` - Filter by category
- `startDate` - Filter from date
- `endDate` - Filter to date

**Example URL**:
```
GET /expenses/export/csv?startDate=2026-01-01&endDate=2026-01-31
```

**Request Body**: None

**Success Response** (200):
- **Content-Type**: `text/csv`
- **Content-Disposition**: `attachment; filename="expenses.csv"`
- CSV file download

---

## 🔑 Authentication Setup

### Using Postman with Cookies

1. **Login first**: Call `POST /auth/login` to get cookies
2. **Cookies auto-send**: Postman automatically includes cookies in subsequent requests
3. **Check cookies**: View in Postman's "Cookies" button (below Send button)

### Using Bearer Token (Alternative)

If cookies don't work, you can extract the token and use it manually:

**Headers**:
```
Authorization: Bearer <your_access_token>
Content-Type: application/json
```

---

## 📝 Postman Collection Example

### Environment Variables
Create these variables in Postman:
- `base_url`: `http://localhost:3000/api`
- `accessToken`: (auto-populated after login)

### Sample Test Workflow

1. **Register**: `POST {{base_url}}/auth/register`
2. **Login**: `POST {{base_url}}/auth/login`
3. **Create Expense**: `POST {{base_url}}/expenses`
4. **Get All**: `GET {{base_url}}/expenses`
5. **Update**: `PUT {{base_url}}/expenses/1`
6. **Delete**: `DELETE {{base_url}}/expenses/1`
7. **Logout**: `POST {{base_url}}/auth/logout`

---

## ⚠️ Common Error Responses

### 401 Unauthorized
```json
{
  "message": "Access token required" 
}
```
**Solution**: Login and ensure cookies/token are sent

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```
**Solution**: You don't own this resource

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```
**Solution**: Check server logs for details

---

## 🚀 Quick Start Testing

```bash
# 1. Start your server
npm run dev

# 2. Test with curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Or use Postman with the endpoints above
```

---

**Last Updated**: January 29, 2026
