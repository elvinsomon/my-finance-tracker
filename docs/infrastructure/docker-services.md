# Docker Services Configuration

## Overview

This document provides detailed technical information about each service in the MyFinanceTracker infrastructure stack. It covers configuration details, networking, volumes, health checks, and technical specifications.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Host Machine (macOS)                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Docker Network: myfinance-network              │ │
│  │                   (Bridge Driver)                      │ │
│  │                                                        │ │
│  │  ┌──────────────────────┐  ┌──────────────────────┐  │ │
│  │  │   PostgreSQL 16      │  │     Seq Logging      │  │ │
│  │  │                      │  │                      │  │ │
│  │  │  Container:          │  │  Container:          │  │ │
│  │  │  myfinance-postgres  │  │  myfinance-seq       │  │ │
│  │  │                      │  │                      │  │ │
│  │  │  Internal: 5432      │  │  Internal: 80, 5341  │  │ │
│  │  │  External: 5432      │  │  External: 5341,5342 │  │ │
│  │  │                      │  │                      │  │ │
│  │  │  Volume:             │  │  Volume:             │  │ │
│  │  │  postgres_data       │  │  seq_data            │  │ │
│  │  └──────────────────────┘  └──────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Port Mappings:                                               │
│  - 5432:5432  (PostgreSQL)                                   │
│  - 5341:80    (Seq Web UI)                                   │
│  - 5342:5341  (Seq Ingestion)                                │
└─────────────────────────────────────────────────────────────┘
```

## Service: PostgreSQL Database

### Basic Configuration

- **Service Name**: `postgres`
- **Container Name**: `myfinance-postgres`
- **Image**: `postgres:16`
- **Official Image**: [postgres on Docker Hub](https://hub.docker.com/_/postgres)
- **Restart Policy**: `unless-stopped`

### Environment Variables

```yaml
POSTGRES_DB: financemanager
  # The name of the default database to create on initialization

POSTGRES_USER: postgres
  # The superuser username
  # WARNING: Change this in production

POSTGRES_PASSWORD: postgres
  # The superuser password
  # WARNING: Change this in production and use Docker secrets

PGDATA: /var/lib/postgresql/data/pgdata
  # The location where PostgreSQL stores database files
  # Set to a subdirectory to avoid permission issues with volume mounting
```

### Port Mapping

- **External Port**: `5432` (accessible from host)
- **Internal Port**: `5432` (within Docker network)
- **Protocol**: TCP
- **Binding**: `0.0.0.0:5432` (all interfaces on host)

**Access from host**:
```bash
psql -h localhost -p 5432 -U postgres -d financemanager
```

**Access from another container**:
```bash
psql -h postgres -p 5432 -U postgres -d financemanager
```

### Volume Configuration

#### Named Volume: `postgres_data`

```yaml
postgres_data:
  driver: local
  name: myfinance_postgres_data
```

**Mount Point**: `/var/lib/postgresql/data`

**Purpose**: Persists all database files, configuration, and WAL logs across container restarts

**Location on Host** (macOS with Docker Desktop):
```
~/Library/Containers/com.docker.docker/Data/vms/0/
```

**View Volume Details**:
```bash
docker volume inspect myfinance_postgres_data
```

#### Bind Mount: Init Script

```yaml
./infrastructure/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
```

- **Source**: `./infrastructure/init-db.sql` (host)
- **Target**: `/docker-entrypoint-initdb.d/init-db.sql` (container)
- **Mode**: Read-only (`:ro`)
- **Purpose**: Automatically execute initialization SQL on first container creation

**Execution Timing**: Runs only when the data directory is empty (first initialization)

### Health Check

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d financemanager"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

**Command**: `pg_isready` checks if PostgreSQL is accepting connections

**Parameters**:
- **interval**: Run check every 10 seconds
- **timeout**: Wait max 5 seconds for response
- **retries**: Try 5 times before marking unhealthy
- **start_period**: Grace period of 10 seconds before health checks begin

**Check Health Status**:
```bash
docker inspect --format='{{.State.Health.Status}}' myfinance-postgres
```

### Network Configuration

- **Network Name**: `myfinance-network`
- **Driver**: bridge
- **DNS Hostname**: `postgres` (resolvable within the network)
- **IP Assignment**: Dynamic (assigned by Docker)

**Other containers can connect using**:
```
Host: postgres
Port: 5432
```

### Resource Limits

No explicit resource limits are set in the current configuration. Docker Desktop default limits apply.

**To add resource limits** (edit docker-compose.yml):
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

### PostgreSQL Configuration

The container uses default PostgreSQL 16 configuration. For custom settings, you can:

1. **Mount custom postgresql.conf**:
```yaml
volumes:
  - ./infrastructure/postgresql.conf:/etc/postgresql/postgresql.conf
```

2. **Use command line parameters**:
```yaml
command:
  - "postgres"
  - "-c"
  - "max_connections=200"
  - "-c"
  - "shared_buffers=256MB"
```

3. **Modify via SQL after startup**:
```sql
ALTER SYSTEM SET max_connections = 200;
SELECT pg_reload_conf();
```

### Extensions Enabled

The init script enables:

1. **uuid-ossp**: UUID generation functions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Provides: uuid_generate_v4()
```

2. **pg_trgm**: Trigram similarity for fuzzy text search
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Useful for merchant name matching, search functionality
```

### Security Considerations

**Current Configuration** (Development):
- Uses default superuser credentials
- No SSL/TLS encryption
- Exposed to host on all interfaces
- No connection pooling

**Production Recommendations**:
1. Use strong, random passwords via Docker secrets
2. Enable SSL/TLS with certificates
3. Create application-specific user with limited privileges
4. Use connection pooling (PgBouncer)
5. Restrict network access
6. Enable audit logging
7. Regular automated backups
8. Use managed database service (AWS RDS, Azure Database, Google Cloud SQL)

---

## Service: Seq Logging Platform

### Basic Configuration

- **Service Name**: `seq`
- **Container Name**: `myfinance-seq`
- **Image**: `datalust/seq:latest`
- **Official Image**: [datalust/seq on Docker Hub](https://hub.docker.com/r/datalust/seq)
- **Restart Policy**: `unless-stopped`

### Environment Variables

```yaml
ACCEPT_EULA: Y
  # Required to accept the Seq End-User License Agreement
  # Must be set to 'Y' or the container will not start
```

**Additional Optional Variables** (not currently set):
```yaml
SEQ_FIRSTRUN_ADMINPASSWORDHASH:
  # Set an admin password on first run (base64 password hash)

SEQ_API_CANONICALURI:
  # The canonical URI for API access
  # Example: "https://seq.mycompany.com"
```

### Port Mapping

Seq exposes two ports:

1. **Web UI Port**:
   - **External**: `5341`
   - **Internal**: `80`
   - **Purpose**: Access Seq web interface
   - **URL**: http://localhost:5341

2. **Ingestion Port**:
   - **External**: `5342`
   - **Internal**: `5341`
   - **Purpose**: Receive logs from applications
   - **Protocol**: HTTP/HTTPS

**Why different mapping?**
- Seq internally listens on port 80 (HTTP) and 5341 (ingestion)
- We map 80 → 5341 and 5341 → 5342 to avoid conflicts with common host services

### Volume Configuration

#### Named Volume: `seq_data`

```yaml
seq_data:
  driver: local
  name: myfinance_seq_data
```

**Mount Point**: `/data`

**Purpose**: Persists all log data, configuration, and user settings

**Contents**:
- Event store (log entries)
- Signal definitions
- Dashboard configurations
- User settings
- API keys
- Retention policies

**View Volume Details**:
```bash
docker volume inspect myfinance_seq_data
```

### Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 20s
```

**Command**: `wget` performs HTTP request to check if web interface is responding

**Parameters**:
- **interval**: Run check every 30 seconds
- **timeout**: Wait max 10 seconds for response
- **retries**: Try 3 times before marking unhealthy
- **start_period**: Grace period of 20 seconds (Seq startup is slower)

**Flags**:
- `--quiet`: Suppress output
- `--tries=1`: Only try once per health check
- `--spider`: Don't download, just check if page exists

**Check Health Status**:
```bash
docker inspect --format='{{.State.Health.Status}}' myfinance-seq
```

### Network Configuration

- **Network Name**: `myfinance-network`
- **Driver**: bridge
- **DNS Hostname**: `seq` (resolvable within the network)
- **IP Assignment**: Dynamic

**Applications can send logs using**:
```
http://seq:5341  (from within Docker network)
http://localhost:5342  (from host machine)
```

### Resource Limits

No explicit resource limits are set. Docker Desktop defaults apply.

**Recommended limits for production**:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Seq Configuration

#### Accessing Seq UI

1. Start the container
2. Wait 20-30 seconds for initialization
3. Open http://localhost:5341
4. Accept EULA (first time only)
5. No authentication required (development mode)

#### Using Seq from .NET Applications

**Install Serilog.Sinks.Seq**:
```bash
dotnet add package Serilog.Sinks.Seq
```

**Configure in Program.cs**:
```csharp
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5342")
    .CreateLogger();
```

**Or in appsettings.json**:
```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.Seq"],
    "MinimumLevel": "Debug",
    "WriteTo": [
      { "Name": "Console" },
      {
        "Name": "Seq",
        "Args": { "serverUrl": "http://localhost:5342" }
      }
    ]
  }
}
```

#### Retention Policies

By default, Seq keeps logs indefinitely. For production, configure retention:

1. Go to Settings → Retention
2. Set retention period (e.g., 30 days)
3. Configure retention based on log level

#### API Keys

For production, create API keys:

1. Settings → API Keys → Add API Key
2. Set permissions and description
3. Use in application configuration:
```csharp
.WriteTo.Seq("http://localhost:5342", apiKey: "your-api-key")
```

### Security Considerations

**Current Configuration** (Development):
- No authentication required
- No HTTPS/TLS
- Exposed to host without restrictions
- No API key required

**Production Recommendations**:
1. Enable authentication (admin password)
2. Create restricted API keys for applications
3. Use HTTPS with valid certificates
4. Restrict network access
5. Set appropriate retention policies
6. Regular backups of Seq data volume
7. Monitor Seq resource usage
8. Use Seq enterprise features for production scale

---

## Shared Network Configuration

### Network: myfinance-network

```yaml
networks:
  myfinance-network:
    driver: bridge
    name: myfinance-network
```

**Driver**: Bridge (default Docker network driver)

**Purpose**: Isolate MyFinanceTracker services from other Docker containers

**Features**:
- Automatic DNS resolution (services can reach each other by name)
- Network isolation from other Docker networks
- Containers can communicate without exposing ports to host

**Network Details**:
```bash
docker network inspect myfinance-network
```

**Connected Containers**:
- postgres (accessible as `postgres:5432`)
- seq (accessible as `seq:80` and `seq:5341`)

**Subnet**: Automatically assigned by Docker (typically `172.x.0.0/16`)

### Inter-Service Communication

Services within the same network can communicate directly:

```bash
# From seq container to postgres
ping postgres

# From postgres container to seq
curl http://seq:80
```

**Example: Backend connecting to both services**:
```csharp
// Database connection
"Host=postgres;Port=5432;Database=financemanager;Username=postgres;Password=postgres"

// Seq logging
.WriteTo.Seq("http://seq:5341")
```

---

## Volume Management

### List All Volumes

```bash
docker volume ls | grep myfinance
```

### Inspect Volume

```bash
docker volume inspect myfinance_postgres_data
docker volume inspect myfinance_seq_data
```

### Backup Volumes

**PostgreSQL**:
```bash
docker exec myfinance-postgres pg_dump -U postgres financemanager > backup.sql
```

**Seq** (backup entire data directory):
```bash
docker run --rm -v myfinance_seq_data:/data -v $(pwd):/backup ubuntu tar czf /backup/seq_backup.tar.gz /data
```

### Restore Volumes

**PostgreSQL**:
```bash
docker exec -i myfinance-postgres psql -U postgres financemanager < backup.sql
```

**Seq**:
```bash
docker run --rm -v myfinance_seq_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/seq_backup.tar.gz -C /
```

### Remove Volumes (WARNING: Deletes all data!)

```bash
docker-compose down -v
```

Or manually:
```bash
docker volume rm myfinance_postgres_data
docker volume rm myfinance_seq_data
```

---

## Performance Tuning

### PostgreSQL Performance

**Key parameters to tune**:

1. **shared_buffers**: Amount of memory for caching data
   - Default: 128MB
   - Recommended: 25% of system RAM
   - Example: 2GB for 8GB system

2. **effective_cache_size**: Estimate of OS cache
   - Default: 4GB
   - Recommended: 50-75% of system RAM

3. **work_mem**: Memory for sorting operations
   - Default: 4MB
   - Recommended: 16-64MB depending on queries

4. **maintenance_work_mem**: Memory for maintenance operations
   - Default: 64MB
   - Recommended: 256MB-1GB

**Apply custom configuration**:
```yaml
command:
  - "postgres"
  - "-c"
  - "shared_buffers=2GB"
  - "-c"
  - "effective_cache_size=6GB"
  - "-c"
  - "work_mem=32MB"
  - "-c"
  - "maintenance_work_mem=512MB"
```

### Seq Performance

Seq is optimized by default for moderate workloads. For high-volume logging:

1. Increase container memory allocation
2. Configure log retention policies
3. Use signal-based filtering
4. Consider Seq clustering (enterprise feature)

---

## Monitoring

### Container Resource Usage

Real-time stats:
```bash
docker stats myfinance-postgres myfinance-seq
```

### Container Logs

```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs postgres
docker-compose logs seq
```

### Health Status

```bash
# All services
docker-compose ps

# Specific service health
docker inspect --format='{{json .State.Health}}' myfinance-postgres | jq
```

---

## Troubleshooting

### Service Won't Start

1. Check logs: `docker-compose logs [service]`
2. Check health: `docker-compose ps`
3. Verify port availability: `lsof -i :[port]`
4. Check Docker resources (Settings → Resources)

### Data Not Persisting

1. Verify volumes exist: `docker volume ls`
2. Check volume mounts: `docker inspect [container]`
3. Ensure not using `docker-compose down -v`

### Network Issues

1. Check network exists: `docker network ls`
2. Inspect network: `docker network inspect myfinance-network`
3. Test connectivity: `docker exec [container] ping [other-container]`

### Performance Issues

1. Check resource usage: `docker stats`
2. Review Docker Desktop resource allocation
3. Check host system resources
4. Review PostgreSQL query performance
5. Check Seq log volume and retention

---

## Production Considerations

### Checklist

- [ ] Use strong, unique passwords
- [ ] Enable SSL/TLS for PostgreSQL
- [ ] Configure Seq authentication
- [ ] Set up automated backups
- [ ] Configure log retention policies
- [ ] Implement monitoring and alerting
- [ ] Use Docker secrets for sensitive data
- [ ] Set resource limits on containers
- [ ] Use specific image versions (not `:latest`)
- [ ] Configure proper restart policies
- [ ] Implement network security (firewall rules)
- [ ] Use managed services for production databases
- [ ] Set up disaster recovery procedures
- [ ] Document runbooks for common issues
- [ ] Implement log aggregation and analysis
- [ ] Configure health check endpoints in application

### Migration to Production

Consider these alternatives for production:

**Database**:
- AWS RDS for PostgreSQL
- Azure Database for PostgreSQL
- Google Cloud SQL for PostgreSQL
- DigitalOcean Managed Databases

**Logging**:
- Seq Cloud (managed)
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog
- New Relic

**Orchestration**:
- Kubernetes (K8s)
- AWS ECS/EKS
- Azure Container Instances/AKS
- Google Kubernetes Engine

---

## Additional Resources

- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
- [Seq Docker Image](https://hub.docker.com/r/datalust/seq)
- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [Seq Documentation](https://docs.datalust.co/)
