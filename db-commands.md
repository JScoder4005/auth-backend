# Manual PostgreSQL Database Commands

## Connect to PostgreSQL

### Option 1: Using DATABASE_URL from .env
```bash
# Load your DATABASE_URL and connect
source .env
psql $DATABASE_URL
```

### Option 2: Direct connection (replace with your actual credentials)
```bash
psql -h <host> -p <port> -U <username> -d <database_name>
```

## Common SQL Queries

Once connected to `psql`, run these commands:

### 1. List all tables
```sql
\dt
```

### 2. View all users
```sql
SELECT * FROM "User";
```

### 3. View all refresh tokens
```sql
SELECT * FROM "RefreshToken";
```

### 4. View users with their token count
```sql
SELECT 
  u.id, 
  u.email, 
  u."createdAt",
  COUNT(rt.id) as token_count
FROM "User" u
LEFT JOIN "RefreshToken" rt ON u.id = rt."userId"
GROUP BY u.id, u.email, u."createdAt";
```

### 5. View specific user by email
```sql
SELECT * FROM "User" WHERE email = 'test@example.com';
```

### 6. Count total users
```sql
SELECT COUNT(*) FROM "User";
```

### 7. Count total refresh tokens
```sql
SELECT COUNT(*) FROM "RefreshToken";
```

### 8. View tokens with user info
```sql
SELECT 
  rt.id,
  rt.token,
  rt."createdAt",
  u.email
FROM "RefreshToken" rt
JOIN "User" u ON rt."userId" = u.id;
```

### 9. Delete a specific user
```sql
DELETE FROM "User" WHERE email = 'test@example.com';
```

### 10. Delete all refresh tokens
```sql
DELETE FROM "RefreshToken";
```

## Exit psql
```sql
\q
```

## Quick One-Liner Commands (from terminal)

### View all users
```bash
psql $DATABASE_URL -c 'SELECT * FROM "User";'
```

### Count users
```bash
psql $DATABASE_URL -c 'SELECT COUNT(*) FROM "User";'
```

### View all tokens
```bash
psql $DATABASE_URL -c 'SELECT * FROM "RefreshToken";'
```

## Using Prisma CLI

### View database in browser (Prisma Studio)
```bash
npx prisma studio
```

### Run migrations
```bash
npx prisma migrate dev
```

### Reset database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

## Using the custom check script
```bash
npx ts-node src/check-db.ts
```
