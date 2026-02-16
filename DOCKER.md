# Docker Setup Guide

## Overview
This project uses Docker with **Alpine Linux** for minimal image size and security. The setup includes:
- 🐳 Multi-stage Dockerfile (Alpine-based)
- 🔧 Docker Compose for development
- 🚀 Production-ready configuration
- 🗄️ PostgreSQL database containerization

---

## Prerequisites

- Docker Desktop installed ([download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- Git (for cloning the repository)

---

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/JScoder4005/auth-backend.git
cd auth-backend

# Copy environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

### 2. Run with Docker Compose

```bash
# Start all services (backend + PostgreSQL)
docker-compose up

# Or run in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

### 3. Access the Application

- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **PostgreSQL**: localhost:5432

---

## Docker Commands Reference

### Development Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# Rebuild images
docker-compose up --build

# View logs
docker-compose logs -f

# Execute command in running container
docker-compose exec backend sh

# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev

# Generate Prisma client
docker-compose exec backend npx prisma generate
```

### Production Commands

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

### Standalone Docker Commands

```bash
# Build image
docker build -t expense-tracker-backend .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-secret" \
  expense-tracker-backend

# View running containers
docker ps

# Stop container
docker stop <container-id>

# Remove container
docker rm <container-id>

# View images
docker images

# Remove image
docker rmi expense-tracker-backend
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=expense_tracker
DB_PORT=5432

# When running with Docker Compose, use:
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/expense_tracker?schema=public

# When running locally without Docker, use:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Docker Architecture

### Multi-Stage Build

**Stage 1: Builder**
- Base: `node:20-alpine`
- Installs build dependencies
- Compiles TypeScript
- Generates Prisma client

**Stage 2: Production**
- Base: `node:20-alpine`
- Copies only necessary files
- Runs as non-root user
- Minimal attack surface

### Image Size Comparison

| Base Image | Size |
|------------|------|
| node:20 (Debian) | ~1.1 GB |
| node:20-alpine | ~180 MB |
| **Our multi-stage** | **~220 MB** |

---

## Services Overview

### Backend Service
- **Container**: `expense-tracker-backend`
- **Port**: 5000
- **Image**: Built from Dockerfile
- **Health Check**: `/api/health` endpoint
- **Auto-restart**: Yes

### PostgreSQL Service
- **Container**: `expense-tracker-db`
- **Port**: 5432
- **Image**: `postgres:16-alpine`
- **Data Persistence**: Named volume `postgres_data`
- **Health Check**: `pg_isready` command

---

## Database Management

### Run Migrations

```bash
# Inside Docker container
docker-compose exec backend npx prisma migrate deploy

# Or create new migration
docker-compose exec backend npx prisma migrate dev --name your_migration_name
```

### Access PostgreSQL

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U postgres -d expense_tracker

# Or use external tool (e.g., pgAdmin, TablePlus)
# Host: localhost
# Port: 5432
# User: postgres
# Password: postgres (from .env)
# Database: expense_tracker
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres expense_tracker > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres expense_tracker < backup.sql
```

---

## Production Deployment

### Using Docker Compose Production

```bash
# 1. Create production .env file
cp .env.example .env.production

# 2. Update with production values
# - Strong JWT secrets
# - Production database credentials
# - Production frontend URL

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# 5. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Security Checklist for Production

- ✅ Change all default passwords
- ✅ Use strong JWT secrets (at least 32 characters)
- ✅ Enable HTTPS with reverse proxy (Nginx/Traefik)
- ✅ Limit PostgreSQL to internal network only
- ✅ Set up automated backups
- ✅ Configure log rotation
- ✅ Use Docker secrets for sensitive data

---

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart services
docker-compose restart
```

### Database Connection Issues

```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Verify DATABASE_URL in .env matches container setup
# For Docker Compose, host should be 'postgres' not 'localhost'
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Change port in .env file
PORT=5001

# Restart services
docker-compose up -d
```

### Reset Everything

```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

### Out of Disk Space

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

---

## Performance Optimization

### Build Cache

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t expense-tracker-backend .
```

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M
```

---

## Monitoring

### Health Checks

```bash
# Check container health
docker ps

# Detailed health status
docker inspect --format='{{json .State.Health}}' expense-tracker-backend

# Test health endpoint manually
curl http://localhost:5000/api/health
```

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats expense-tracker-backend
```

---

## Development Workflow

### Hot Reload (Not Included by Default)

For development with hot reload, add volume mount:

```yaml
services:
  backend:
    volumes:
      - ./src:/app/src  # Mount source code
    command: npm run dev  # Use dev script with nodemon
```

### VS Code DevContainers

Create `.devcontainer/devcontainer.json` for integrated development.

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose)
- [Alpine Linux](https://alpinelinux.org)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-ecs)

---

## Summary

✅ **Easy Setup** - One command to start everything  
✅ **Minimal Size** - Alpine-based images (~220MB)  
✅ **Security** - Non-root user, minimal dependencies  
✅ **Production Ready** - Separate prod configuration  
✅ **Database Included** - PostgreSQL with persistence  
✅ **Health Checks** - Automatic monitoring  

Need help? Check the [troubleshooting section](#troubleshooting) or open an issue on GitHub!
