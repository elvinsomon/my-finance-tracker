# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyFinanceTracker is a personal finance management application with multi-currency support, budgeting, savings goals, and AI-powered features. The project follows a layered architecture with separate backend (.NET Web API) and frontend (React + Tailwind CSS).

**Current Phase**: MVP Core (Fase 1) - Basic functionality for transaction management and visualization.

## Technology Stack

**Backend**:
- .NET Web API
- Entity Framework Core (Code-First)
- PostgreSQL
- JWT Authentication
- Serilog + Seq (logging)
- Mapster (object mapping)
- FluentValidation

**Frontend**:
- React
- Tailwind CSS
- Chart.js/Recharts (for visualizations)

**Infrastructure**:
- Docker (containerization)
- Ollama (future ML/AI integration)

## Common Development Commands

### Backend (.NET)

All backend commands should be run from the `backend/` directory:

```bash
# Check .NET version
dotnet --version

# Restore dependencies
TMPDIR=/tmp dotnet restore

# Build solution
TMPDIR=/tmp dotnet build

# Build without restore
TMPDIR=/tmp dotnet build --no-restore

# Run API
dotnet run --project FinanceManager.API

# Entity Framework migrations
TMPDIR=/tmp dotnet ef migrations add <MigrationName> --project FinanceManager.Infrastructure --startup-project FinanceManager.API
TMPDIR=/tmp dotnet ef database update --project FinanceManager.Infrastructure --startup-project FinanceManager.API

# Rollback migration
TMPDIR=/tmp dotnet ef database update <PreviousMigrationName> --project FinanceManager.Infrastructure --startup-project FinanceManager.API
```

**Note**: Use `TMPDIR=/tmp` prefix on macOS to avoid /var/folders permission issues with .NET tooling.

### Docker

```bash
# Start services (PostgreSQL, Seq)
docker-compose up -d

# Stop services
docker stop <container-id>

# Execute commands in container
docker exec -it <container-id> <command>
```

## Architecture

### Layered Architecture (3 Layers)

The backend follows a **strict layered architecture** with clear separation of concerns:

```
backend/
├── FinanceManager.sln
├── FinanceManager.API/          # Presentation Layer
├── FinanceManager.Core/         # Domain Layer
└── FinanceManager.Infrastructure/  # Infrastructure Layer
```

#### 1. FinanceManager.Core (Domain)
- **Purpose**: Business logic, domain entities, interfaces
- **Dependencies**: None (independent)
- **Contains**:
  - `Entities/`: Domain models (User, Transaction, Category, Budget, SavingsGoal, etc.)
  - `Interfaces/Repositories/`: Repository interfaces
  - `Interfaces/Services/`: Service interfaces
  - `Validators/`: FluentValidation validators
  - `Exceptions/`: Custom business exceptions
  - `Enums/`: Enumerations

#### 2. FinanceManager.Infrastructure (Infrastructure)
- **Purpose**: Data access, external services, technical concerns
- **Dependencies**: FinanceManager.Core
- **Contains**:
  - `Data/ApplicationDbContext.cs`: EF Core DbContext
  - `Data/Configurations/`: Fluent API entity configurations
  - `Data/Migrations/`: EF Core migrations
  - `Repositories/`: Repository implementations
  - `UnitOfWork/`: Unit of Work pattern implementation
  - `Seeders/`: Database seed data

#### 3. FinanceManager.API (Presentation)
- **Purpose**: REST API endpoints, request/response handling
- **Dependencies**: FinanceManager.Core, FinanceManager.Infrastructure
- **Contains**:
  - `Controllers/`: API endpoints
  - `DTOs/Requests/` & `DTOs/Responses/`: Data Transfer Objects
  - `Mappings/`: Mapster configurations
  - `Middleware/`: Custom middleware (exception handling)
  - `Filters/`: Action/Exception filters
  - `Services/`: Application services
  - `Program.cs`: Startup configuration

### Key Patterns

**Repository Pattern**: Abstracts data access with generic `IRepository<T>` interface.

**Unit of Work**: Groups repository operations in a single transaction via `IUnitOfWork`.

**Dependency Injection**: All services/repositories registered in DI container.

### Data Flow

```
HTTP Request → Controller (API)
    ↓
Validate DTO & Map to Entity
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
DbContext → PostgreSQL
    ↓
Response (Map Entity to DTO)
```

## Database

### Code-First Approach

The project uses **EF Core Code-First** approach:
1. Define/modify entities in `FinanceManager.Core/Entities/`
2. Configure entities in `Infrastructure/Data/Configurations/`
3. Generate migration: `dotnet ef migrations add <Name>`
4. Apply migration: `dotnet ef database update`

### Key Entities

- **Users**: User accounts with authentication
- **FinancialAccounts**: Bank accounts, credit cards, etc.
- **Categories**: Transaction categories (hierarchical)
- **Transactions**: Income/expense records with multi-currency support
- **TransactionItems**: Itemized breakdown of transactions
- **Budgets**: Monthly spending limits per category
- **SavingsGoals**: Savings targets with progress tracking
- **Tags**: Custom labels for transactions
- **RecurringTransactions**: Scheduled recurring transactions
- **CategoryRules**: Auto-categorization rules
- **ExchangeRates**: Currency conversion rates

See `docs/infrastructure/database-squema.md` for complete schema diagram.

## Authentication & Authorization

**JWT (JSON Web Tokens)**:
- Login endpoint: `POST /api/auth/login`
- Token header: `Authorization: Bearer <token>`
- Token lifetime: Configurable via `appsettings.json` (default: 24h)

## Logging

**Serilog + Seq**:
- Console and Seq sinks configured
- Seq UI: http://localhost:5341
- Log levels: Information, Warning, Error, Fatal
- Structured logging with properties

## Error Handling

**Global Exception Middleware** returns consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Detail 1", "Detail 2"]
}
```

**Custom Exceptions**:
- `NotFoundException` → 404
- `ValidationException` → 400
- `UnauthorizedException` → 401
- `BusinessException` → 422

## Validation

**FluentValidation**:
- Validators in `FinanceManager.Core/Validators/`
- Auto-registration via DI
- Validates DTOs before business logic

## Object Mapping

**Mapster**:
- Lightweight, fast mapping
- Usage: `request.Adapt<Transaction>()`
- Custom configurations in `API/Mappings/`

## Development Workflow

1. **Read documentation** in `docs/` to understand requirements
2. **Define entities** in `FinanceManager.Core/Entities/`
3. **Configure entities** in `Infrastructure/Data/Configurations/`
4. **Generate migration** and update database
5. **Create repository interface** in `Core/Interfaces/Repositories/`
6. **Implement repository** in `Infrastructure/Repositories/`
7. **Create service interface** in `Core/Interfaces/Services/`
8. **Implement service** in `API/Services/` or separate service layer
9. **Create DTOs** in `API/DTOs/`
10. **Create controller** in `API/Controllers/`
11. **Test endpoints** via Swagger UI or API client

## Important Notes

- **TMPDIR on macOS**: Always prefix EF Core commands with `TMPDIR=/tmp` to avoid permission issues
- **Dependencies**: Core has NO dependencies; Infrastructure depends on Core; API depends on both
- **Async/Await**: All I/O operations must be asynchronous
- **Connection String**: Default in `appsettings.json` points to `localhost:5432/financemanager`
- **Multi-currency**: All transactions store currency, exchange rate, and base currency amount
- **Soft Deletes**: Use `IsActive` flags instead of hard deletes where appropriate

## Future Phases

### **Fase 2 - Expansión** 
**Objetivo:** Funcionalidades avanzadas de gestión y análisis

7. ✅ Importación de estados de cuenta
   - Parser de CSV bancarios
   - Reconciliación automática
   
8. ✅ Módulo de metas de ahorro
   - Definición de metas
   - Tracking de progreso
   - Calculadora de ahorro
   
9. ✅ Reportes avanzados
   - Comparativas temporales
   - Gráficos de distribución
   - Análisis de tendencias
   
10. ✅ Detalle de transacciones (items)
    - Desglose de compras
    - Categorización individual de items

**Entregables Fase 2:**
- Sistema de importación robusto
- Dashboard expandido con reportes
- Módulo de ahorros completamente funcional

---

### **Fase 3 - Inteligencia** 
**Objetivo:** Capacidades de IA y automatización

11. ✅ OCR para facturas
    - Integración con Ollama + modelo de visión
    - Extracción automática de datos
    
12. ✅ Categorización automática con ML
    - Entrenamiento con datos históricos
    - Sugerencias inteligentes
    
13. ✅ Predicciones y análisis avanzado
    - Proyecciones de gasto
    - Detección de anomalías
    - Identificación de patrones
    
14. ✅ Chatbot financiero
    - Consultas en lenguaje natural
    - Respuestas basadas en datos reales

**Entregables Fase 3:**
- Sistema OCR operativo
- Modelos ML entrenados y en producción
- Chatbot integrado en la interfaz
See `docs/mvp-plan.md` for complete roadmap.
