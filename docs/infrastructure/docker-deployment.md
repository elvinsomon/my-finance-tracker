# Docker Deployment Guide - MyFinanceTracker

## Overview

This guide explains how to run the entire MyFinanceTracker application stack using Docker Compose.

## Architecture

The application consists of 4 services running in Docker containers:

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                  myfinance-network                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │PostgreSQL│  │   Seq    │  │  Backend │  │Frontend │ │
│  │  :5432   │  │  :5341   │  │  API     │  │ React   │ │
│  │          │  │  :5342   │  │  :5000   │  │ :3000   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│       ↓              ↓             ↓             ↓       │
│  [Volume]      [Volume]                                 │
└─────────────────────────────────────────────────────────┘
```

## Services

### 1. PostgreSQL Database
- **Image**: `postgres:16`
- **Port**: `5432`
- **Database**: `financemanager`
- **Credentials**: `postgres/postgres` (dev only)
- **Volume**: `myfinance_postgres_data`

### 2. Seq Logging
- **Image**: `datalust/seq:2024`
- **Web UI**: `http://localhost:5341`
- **Ingestion**: `http://localhost:5342`
- **Volume**: `myfinance_seq_data`

### 3. Backend API (.NET)
- **Built from**: `./backend/Dockerfile`
- **Port**: `http://localhost:5000`
- **Swagger**: `http://localhost:5000/swagger`
- **Environment**: Production mode with all configurations via environment variables

### 4. Frontend (React)
- **Built from**: `./src/finance-tracker-ui/Dockerfile`
- **Port**: `http://localhost:3000`
- **Nginx**: Serves static files with optimizations
- **API URL**: Configured at build time

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB free disk space

## Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

This will:
1. Build the backend API Docker image
2. Build the frontend Docker image
3. Pull PostgreSQL and Seq images
4. Start all services in correct order
5. Run database migrations automatically

### 2. Verify Services

```bash
docker-compose ps
```

Expected output:
```
NAME                   STATUS    PORTS
myfinance-api          Up        0.0.0.0:5000->80/tcp
myfinance-frontend     Up        0.0.0.0:3000->80/tcp
myfinance-postgres     Up        0.0.0.0:5432->5432/tcp
myfinance-seq          Up        0.0.0.0:5341->80/tcp
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **Seq Logs**: http://localhost:5341

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f seq
```

### Stop Services

```bash
# Stop all
docker-compose stop

# Stop specific service
docker-compose stop frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Rebuild Services

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build api
docker-compose build frontend

# Rebuild and restart
docker-compose up -d --build
```

### Stop and Remove Everything

```bash
# Stop and remove containers (keeps volumes)
docker-compose down

# Stop, remove containers and volumes (DELETES DATA)
docker-compose down -v
```

## Development Workflow

### Frontend Development

If you want to modify frontend code and see changes:

```bash
# Option 1: Rebuild frontend container
docker-compose build frontend
docker-compose up -d frontend

# Option 2: Run frontend locally (recommended for dev)
cd src/finance-tracker-ui
npm run dev
# Access at http://localhost:5173
```

### Backend Development

If you want to modify backend code and see changes:

```bash
# Option 1: Rebuild backend container
docker-compose build api
docker-compose up -d api

# Option 2: Run backend locally (recommended for dev)
cd backend
dotnet run --project FinanceManager.API
# Access at http://localhost:5000
```

## Environment Variables

### Backend (API Service)

All configuration is done via environment variables in `docker-compose.yml`:

```yaml
environment:
  - ASPNETCORE_ENVIRONMENT=Production
  - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;...
  - Jwt__Secret=YourSecretKey
  - Jwt__Issuer=FinanceManagerAPI
  - Jwt__Audience=FinanceManagerClient
  - Jwt__ExpirationHours=24
  - Serilog__WriteTo__0__Name=Console
  - Serilog__WriteTo__1__Name=Seq
  - Serilog__WriteTo__1__Args__serverUrl=http://seq:5341
```

### Frontend (Build Args)

Frontend configuration is set at **build time**:

```yaml
build:
  args:
    - VITE_API_URL=http://localhost:5000/api
```

**Note**: If you change `VITE_API_URL`, you must rebuild:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Volumes and Data Persistence

### Persistent Volumes

- `myfinance_postgres_data`: PostgreSQL database files
- `myfinance_seq_data`: Seq log data

### Backup Database

```bash
# Create backup
docker exec myfinance-postgres pg_dump -U postgres financemanager > backup.sql

# Restore backup
docker exec -i myfinance-postgres psql -U postgres financemanager < backup.sql
```

### Clear All Data

```bash
docker-compose down -v
docker volume rm myfinance_postgres_data myfinance_seq_data
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using port 5000
lsof -i :5000

# Change port in docker-compose.yml
ports:
  - "5001:80"  # Changed from 5000
```

### Backend Won't Start

```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Database not ready - wait a few seconds and check again
# 2. Build errors - rebuild with docker-compose build api
```

### Frontend Can't Connect to Backend

Check:
1. Backend is running: `curl http://localhost:5000/swagger`
2. API URL is correct in frontend build
3. CORS is enabled in backend for localhost:3000

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker exec myfinance-postgres pg_isready -U postgres

# Check connection string
docker-compose logs api | grep "Connection"

# Reset database
docker-compose down
docker volume rm myfinance_postgres_data
docker-compose up -d
```

## Performance Optimization

### Build Optimization

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Build in parallel
docker-compose build --parallel
```

### Resource Limits

Add to `docker-compose.yml`:

```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
      reservations:
        memory: 256M
```

## Production Deployment

**⚠️ IMPORTANT**: This docker-compose.yml is for **DEVELOPMENT ONLY**.

For production, you need:

1. **Security**:
   - Change all passwords
   - Use Docker secrets
   - Enable SSL/TLS
   - Configure firewall rules

2. **Scalability**:
   - Use managed PostgreSQL (AWS RDS, Azure Database)
   - Use orchestration (Kubernetes, Docker Swarm)
   - Add load balancer
   - Configure auto-scaling

3. **Monitoring**:
   - Add Prometheus/Grafana
   - Configure alerts
   - Set up logging aggregation

4. **Backup**:
   - Automated database backups
   - Disaster recovery plan
   - Multi-region replication

## Network Configuration

All services run on a shared bridge network `myfinance-network`.

### Inter-Service Communication

Services can communicate using service names:
- Frontend → Backend: `http://api:80/api`
- Backend → PostgreSQL: `postgres:5432`
- Backend → Seq: `http://seq:5341`

### External Access

Only these ports are exposed to host:
- `3000`: Frontend (public)
- `5000`: Backend API (public)
- `5432`: PostgreSQL (should be firewalled in production)
- `5341`: Seq UI (should be protected in production)

## Health Checks

### Configured Health Checks

- **PostgreSQL**: `pg_isready` command
- **Seq**: HTTP check on root endpoint
- **Frontend**: HTTP check on `/health` endpoint

### Manual Health Checks

```bash
# PostgreSQL
docker exec myfinance-postgres pg_isready

# Backend API
curl http://localhost:5000/swagger

# Frontend
curl http://localhost:3000/health

# Seq
curl http://localhost:5341
```

## Logs and Debugging

### View Application Logs

```bash
# Real-time logs for all services
docker-compose logs -f

# Backend API logs
docker-compose logs -f api

# With timestamp
docker-compose logs -f --timestamps api
```

### Access Seq Logs

1. Open http://localhost:5341
2. All backend logs are automatically sent here
3. Use filters to search logs

### Container Shell Access

```bash
# Backend container
docker exec -it myfinance-api /bin/bash

# Frontend container
docker exec -it myfinance-frontend /bin/sh

# PostgreSQL container
docker exec -it myfinance-postgres psql -U postgres -d financemanager
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build images
        run: docker-compose build

      - name: Run tests
        run: docker-compose up -d && ./run-tests.sh

      - name: Push to registry
        run: |
          docker tag myfinance-api:latest registry.example.com/myfinance-api:latest
          docker push registry.example.com/myfinance-api:latest
```

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Check documentation in `/docs/infrastructure/`
4. Review Seq logs at http://localhost:5341

---

**Last Updated**: 2025-10-13
**Version**: 1.0
