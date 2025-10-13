# MyFinanceTracker Infrastructure Setup Guide

## Overview

This guide covers the complete setup of the MyFinanceTracker infrastructure for local development. The infrastructure consists of two main services running in Docker containers:

- **PostgreSQL 16**: Main application database
- **Seq**: Centralized structured logging platform

## Prerequisites

Before starting, ensure you have the following installed:

- **Docker Desktop** (version 20.10 or higher)
  - macOS: [Download Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - Windows: [Download Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose** (included with Docker Desktop, or install separately for Linux)

Verify installations:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Start All Services

From the project root directory (`/Users/elvinsomon/Documents/Proyectos/MyFinanceTracker`):

```bash
docker-compose up -d
```

This command will:
- Download required Docker images (first time only)
- Create named volumes for data persistence
- Start PostgreSQL and Seq containers
- Create the shared network
- Run database initialization scripts

### 2. Verify Services Are Running

Check container status:
```bash
docker-compose ps
```

Expected output:
```
NAME                    IMAGE                    STATUS
myfinance-postgres      postgres:16              Up (healthy)
myfinance-seq           datalust/seq:latest      Up (healthy)
```

### 3. Access Services

- **PostgreSQL Database**: `localhost:5432`
- **Seq Web UI**: http://localhost:5341

## Detailed Service Information

### PostgreSQL Database

**Connection Details:**
- Host: `localhost` (or `postgres` from within Docker network)
- Port: `5432`
- Database: `financemanager`
- Username: `postgres`
- Password: `postgres`

**Connection Strings:**

For .NET applications:
```
Host=localhost;Port=5432;Database=financemanager;Username=postgres;Password=postgres
```

For Entity Framework Core:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=financemanager;Username=postgres;Password=postgres"
}
```

**Connecting via psql CLI:**
```bash
docker exec -it myfinance-postgres psql -U postgres -d financemanager
```

**Useful psql Commands:**
```sql
\l                  -- List all databases
\dt                 -- List all tables
\d+ table_name      -- Describe a table
\q                  -- Quit psql
```

### Seq Logging Platform

**Access Details:**
- Web UI: http://localhost:5341
- Ingestion Endpoint: http://localhost:5342

**Using Seq:**
1. Open http://localhost:5341 in your browser
2. Accept the EULA if prompted (first time only)
3. View real-time logs from your application
4. Use filters, queries, and dashboards to analyze logs

**Sending Logs to Seq:**

From .NET applications using Serilog:
```csharp
Log.Logger = new LoggerConfiguration()
    .WriteTo.Seq("http://localhost:5342")
    .CreateLogger();
```

## Common Operations

### Starting Services

Start all services in detached mode:
```bash
docker-compose up -d
```

Start with logs visible (foreground):
```bash
docker-compose up
```

Start specific service only:
```bash
docker-compose up -d postgres
docker-compose up -d seq
```

### Stopping Services

Stop all services (preserves data):
```bash
docker-compose stop
```

Stop and remove containers (preserves data):
```bash
docker-compose down
```

Stop specific service:
```bash
docker-compose stop postgres
docker-compose stop seq
```

### Viewing Logs

View logs from all services:
```bash
docker-compose logs -f
```

View logs from specific service:
```bash
docker-compose logs -f postgres
docker-compose logs -f seq
```

View last 100 lines:
```bash
docker-compose logs --tail=100 postgres
```

### Restarting Services

Restart all services:
```bash
docker-compose restart
```

Restart specific service:
```bash
docker-compose restart postgres
docker-compose restart seq
```

### Checking Service Health

Check health status:
```bash
docker-compose ps
```

Inspect container details:
```bash
docker inspect myfinance-postgres
docker inspect myfinance-seq
```

## Data Persistence

### Volumes

Data is persisted in Docker named volumes:

- **postgres_data**: PostgreSQL database files
- **seq_data**: Seq logs and configuration

List volumes:
```bash
docker volume ls | grep myfinance
```

Inspect volume:
```bash
docker volume inspect myfinance_postgres_data
docker volume inspect myfinance_seq_data
```

### Backing Up Data

**PostgreSQL Backup:**
```bash
# Backup database to file
docker exec myfinance-postgres pg_dump -U postgres financemanager > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use pg_dumpall for all databases
docker exec myfinance-postgres pg_dumpall -U postgres > backup_all_$(date +%Y%m%d_%H%M%S).sql
```

**Restore PostgreSQL Backup:**
```bash
# Restore from backup file
docker exec -i myfinance-postgres psql -U postgres financemanager < backup_file.sql
```

### Resetting Data (Clean Slate)

**WARNING: This will delete all data!**

Stop services and remove volumes:
```bash
docker-compose down -v
```

Then start fresh:
```bash
docker-compose up -d
```

## Database Initialization

The initialization script (`infrastructure/init-db.sql`) runs automatically when the PostgreSQL container is created for the first time. It performs:

1. Enables UUID extension for ID generation
2. Enables pg_trgm extension for text search
3. Sets timezone to UTC
4. Displays initialization success message

**To manually run initialization after setup:**
```bash
docker exec -i myfinance-postgres psql -U postgres -d financemanager < infrastructure/init-db.sql
```

## Troubleshooting

### Services Won't Start

**Issue**: Port already in use
```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Solution**:
- Check if PostgreSQL is already running on your system: `lsof -i :5432`
- Stop the conflicting service or change the port in `docker-compose.yml`
- For macOS, stop system PostgreSQL: `brew services stop postgresql`

### Cannot Connect to PostgreSQL

**Issue**: Connection refused or timeout

**Solutions**:
1. Verify container is running and healthy:
   ```bash
   docker-compose ps
   ```

2. Check container logs:
   ```bash
   docker-compose logs postgres
   ```

3. Ensure container has finished initialization (wait ~10 seconds after start)

4. Test connection:
   ```bash
   docker exec myfinance-postgres pg_isready -U postgres
   ```

### Seq Web UI Not Loading

**Issue**: Cannot access http://localhost:5341

**Solutions**:
1. Verify Seq container is running:
   ```bash
   docker-compose ps seq
   ```

2. Check Seq logs for errors:
   ```bash
   docker-compose logs seq
   ```

3. Wait 20-30 seconds for Seq to fully start (first launch is slower)

4. Try accessing with different browser or incognito mode

### Database Performance Issues

**Issue**: Slow queries or high resource usage

**Solutions**:
1. Check Docker resource allocation (Docker Desktop > Settings > Resources)
2. Increase allocated memory to at least 4GB
3. Review and optimize database queries
4. Check container resource usage:
   ```bash
   docker stats myfinance-postgres
   ```

### Lost Data After Restart

**Issue**: Data not persisting between restarts

**Cause**: Using `docker-compose down -v` which removes volumes

**Solution**:
- Use `docker-compose down` (without `-v`) to preserve volumes
- Restore from backup if data was lost

### Permission Denied Errors

**Issue**: PostgreSQL container fails with permission errors

**Solutions**:
1. Ensure Docker has proper permissions
2. On Linux, check volume ownership:
   ```bash
   docker exec myfinance-postgres ls -la /var/lib/postgresql/data
   ```
3. Recreate containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Resetting After Errors

If something goes wrong, perform a full reset:

```bash
# Stop and remove everything
docker-compose down -v

# Remove any orphaned containers
docker container prune

# Remove any orphaned volumes
docker volume prune

# Start fresh
docker-compose up -d
```

## Integration with Backend

### Entity Framework Core Migrations

Once the infrastructure is running, set up your database schema:

```bash
# From the backend project directory
cd backend/MyFinanceTracker.API

# Install EF Core tools if not already installed
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate --project ../MyFinanceTracker.Infrastructure --startup-project .

# Apply migrations to database
dotnet ef database update --project ../MyFinanceTracker.Infrastructure --startup-project .
```

### appsettings.json Configuration

Update your `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=financemanager;Username=postgres;Password=postgres"
  },
  "Serilog": {
    "WriteTo": [
      {
        "Name": "Seq",
        "Args": {
          "serverUrl": "http://localhost:5342"
        }
      }
    ]
  }
}
```

## Security Notes

**IMPORTANT**: The credentials in this setup are for **DEVELOPMENT ONLY**.

- Default password is `postgres` (insecure)
- Ports are exposed to localhost
- No SSL/TLS encryption configured
- No authentication on Seq

**For Production:**
- Use strong, randomly generated passwords
- Store credentials in environment variables or secrets management
- Enable SSL/TLS for PostgreSQL
- Configure authentication for Seq
- Use private networks, not exposed ports
- Implement proper backup strategies
- Use managed database services (RDS, Azure Database, etc.)

## Next Steps

After infrastructure setup:

1. Verify services are healthy: `docker-compose ps`
2. Access Seq UI to confirm it's working: http://localhost:5341
3. Test PostgreSQL connection with psql
4. Set up your backend application with connection strings
5. Run EF Core migrations to create database schema
6. Seed initial data (users, categories, exchange rates)
7. Start your backend API and verify logging to Seq

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/16/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Seq Documentation](https://docs.datalust.co/docs)
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review container logs: `docker-compose logs`
- Inspect container health: `docker-compose ps`
- Review the `docs/infrastructure/docker-services.md` for detailed service configuration
