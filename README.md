# MyFinanceTracker

Personal finance management application with multi-currency support, budgeting, savings goals, and AI-powered features.

## 🚀 Quick Start (Docker)

Start the entire application with one command:

```bash
docker-compose up -d
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Documentation**: http://localhost:5001/swagger (disabled in Production mode)
- **Logs (Seq)**: http://localhost:5341

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB free disk space

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌─────────┐
│   React     │────▶│  .NET API   │────▶│  PostgreSQL  │     │   Seq   │
│  Frontend   │     │   Backend   │     │   Database   │     │  Logs   │
│  (port 3000)│     │  (port 5000)│     │  (port 5432) │     │ (5341)  │
└─────────────┘     └─────────────┘     └──────────────┘     └─────────┘
```

### Project Structure

```
MyFinanceTracker/
├── src/
│   ├── FinanceTrackerAPI/          # Backend .NET Web API
│   │   ├── FinanceManager.sln
│   │   ├── FinanceManager.API/     # Presentation Layer
│   │   ├── FinanceManager.Core/    # Domain Layer
│   │   └── FinanceManager.Infrastructure/  # Infrastructure Layer
│   └── finance-tracker-ui/         # Frontend React Application
├── docs/
│   ├── backend/                    # Backend-specific documentation
│   ├── frontend/                   # Frontend-specific documentation
│   ├── infrastructure/             # Infrastructure documentation
│   └── [general docs]              # Project-wide documentation
├── docker-compose.yml              # Docker orchestration
├── CLAUDE.md                       # Development guide for Claude Code
└── README.md                       # This file
```

### Technology Stack

**Backend**:
- .NET 9.0 Web API
- Entity Framework Core (Code-First)
- PostgreSQL 16
- JWT Authentication
- Serilog + Seq
- Mapster, FluentValidation

**Frontend**:
- React 18 + Vite
- Tailwind CSS
- Chart.js
- React Router
- Axios

**Infrastructure**:
- Docker + Docker Compose
- Nginx (frontend serving)

## 📖 Documentation

### Root Level
- **[CLAUDE.md](./CLAUDE.md)**: Development guide for Claude Code
- **[README.md](./README.md)**: This file - Quick start and overview

### General Documentation (`/docs/`)
- **[MVP Plan](./docs/mvp-plan.md)**: Complete project roadmap and phases
- **[Project Status](./docs/PROJECT-STATUS.md)**: Current implementation status
- **[API Contracts](./docs/api-contracts.md)**: Complete API endpoint documentation
- **[Functional Requirements](./docs/functional-requirements.md)**: Feature specifications
- **[CSV Import Specification](./docs/feature4-csv-import-specification.md)**: Detailed import feature spec
- **[Phase 2 Plan](./docs/phase2-plan.md)**: Expansion phase details
- **[Changelog](./docs/CHANGELOG.md)**: Version history

### Backend Documentation (`/docs/backend/`)
- **[Backend Architecture](./docs/backend/backend-architecture.md)**: API architecture details
- **[Layered Architecture](./docs/backend/layered-architecture.md)**: 3-layer pattern explanation
- **[EF Core Code-First](./docs/backend/efcore-code-first.md)**: Database approach guidelines
- **[Implementation Log](./docs/backend/implementation-log.md)**: Backend development history

### Frontend Documentation (`/docs/frontend/`)
- **[API Integration](./docs/frontend/api-integration.md)**: Frontend API client setup
- **[Component Library](./docs/frontend/component-library.md)**: UI components guide
- **[Routing](./docs/frontend/routing.md)**: React Router configuration
- **[UI Decisions](./docs/frontend/ui-decisions.md)**: Design system choices
- **[Implementation Log](./docs/frontend/implementation-log.md)**: Frontend development history
- **Implementation Guides**: Detailed guides for Sidebar, TopBar, StatCard, Charts, etc.

### Infrastructure Documentation (`/docs/infrastructure/`)
- **[Database Schema](./docs/infrastructure/database-squema.md)**: Complete database design
- **[Docker Services](./docs/infrastructure/docker-services.md)**: Container configuration
- **[Docker Deployment](./docs/infrastructure/docker-deployment.md)**: Deployment guide
- **[Setup Guide](./docs/infrastructure/setup.md)**: Infrastructure setup instructions
- **[Implementation Log](./docs/infrastructure/implementation-log.md)**: Infrastructure history

## 🛠️ Development

### Local Development (Without Docker)

#### Backend
```bash
cd src/FinanceTrackerAPI
dotnet run --project FinanceManager.API
# API runs at http://localhost:5000
```

#### Frontend
```bash
cd src/finance-tracker-ui
npm install
npm run dev
# UI runs at http://localhost:5173
```

#### Database (Required)
```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Apply migrations
cd src/FinanceTrackerAPI
TMPDIR=/tmp dotnet ef database update --project FinanceManager.Infrastructure --startup-project FinanceManager.API
```

### Common Commands

```bash
# View logs
docker-compose logs -f

# Rebuild services
docker-compose build api frontend
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove data (⚠️ DELETES DATABASE)
docker-compose down -v

# Access database
docker exec -it myfinance-postgres psql -U postgres -d financemanager
```

## 📊 Phase 1 Features (MVP Core)

- ✅ User registration and JWT authentication
- ✅ Manual transaction recording (income/expense)
- ✅ Category system (predefined + custom)
- ✅ Multi-currency support (DOP, USD, EUR)
- ✅ Monthly budgets with visual progress
- ✅ Multiple financial accounts
- ✅ Dashboard with charts
- ✅ CSV export
- ✅ Responsive UI (mobile-first)

## 🗺️ Roadmap

### Phase 2 (Expansion)
- Bank statement import
- Advanced reports
- Savings goals module
- Transaction itemization

### Phase 3 (Intelligence)
- OCR for receipts (Ollama)
- ML-based auto-categorization
- Spending predictions
- Financial chatbot

See [MVP Plan](./docs/mvp-plan.md) for details.

## 🔧 Configuration

### Environment Variables

**Backend** (configured in docker-compose.yml):
```env
ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;...
Jwt__Secret=YourSecretKey
Jwt__ExpirationHours=24
```

**Frontend** (set at build time):
```env
VITE_API_URL=http://localhost:5001/api
```

To change frontend API URL:
```bash
# Edit docker-compose.yml, then:
docker-compose build frontend
docker-compose up -d frontend
```

## 📝 API Usage Example

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "John Doe",
    "defaultCurrency": "DOP"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

### 3. Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountId": "account-guid",
    "categoryId": "category-guid",
    "type": "Expense",
    "amount": 1500,
    "currency": "DOP",
    "date": "2025-10-12",
    "description": "Supermercado"
  }'
```

See [API Contracts](./docs/api-contracts.md) for all endpoints.

## 🧪 Testing

```bash
# Frontend tests
cd src/finance-tracker-ui
npm test

# Backend tests (when implemented)
cd backend
dotnet test
```

## 🐛 Troubleshooting

### Port conflicts
```bash
# Change ports in docker-compose.yml if 3000/5000 are in use
ports:
  - "3001:80"  # Frontend
  - "5001:80"  # Backend
```

### Database connection errors
```bash
# Wait for postgres to be ready
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:5001/api/auth/login`
- Check CORS configuration in backend
- Ensure API_URL is correct in docker-compose.yml

### Port 5000 already in use
macOS Control Center uses port 5000 by default. The app is configured to use port 5001 instead.

See [Docker Deployment Guide](./docs/infrastructure/docker-deployment.md) for more troubleshooting.

## 📄 License

This project is for personal use and educational purposes.

## 👥 Authors

- Development with Claude Code assistance

## 📞 Support

For issues and questions:
1. Check documentation in `/docs`
2. Review logs: `docker-compose logs -f`
3. Check Seq logs: http://localhost:5341

---

**Last Updated**: 2025-10-13
**Version**: Phase 1 MVP
