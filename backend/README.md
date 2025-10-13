# MyFinanceTracker - Backend API

API REST construida con .NET 9, Entity Framework Core y PostgreSQL para la gestión de finanzas personales.

## Arquitectura

```
backend/
├── FinanceManager.sln
├── FinanceManager.Core/         # Domain Layer (Entities, Interfaces, Validators)
├── FinanceManager.Infrastructure/ # Data Layer (DbContext, Repositories, Migrations)
└── FinanceManager.API/           # Presentation Layer (Controllers, DTOs, Services)
```

**Patrón**: Layered Architecture con Repository Pattern y Unit of Work

## Requisitos

- .NET 9 SDK
- PostgreSQL 16+
- Docker (opcional, para PostgreSQL y Seq)

## Configuración Rápida

### 1. Iniciar Base de Datos (Docker)

```bash
docker run --name postgres-finance \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=financemanager \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Iniciar Seq para Logging (Opcional)

```bash
docker run --name seq-finance \
  -e ACCEPT_EULA=Y \
  -p 5341:80 \
  -d datalust/seq:latest
```

### 3. Restaurar Dependencias

```bash
cd backend
dotnet restore
```

### 4. Compilar

```bash
dotnet build
```

### 5. Ejecutar API

```bash
dotnet run --project FinanceManager.API
```

La API estará disponible en:
- **API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **Seq Dashboard**: http://localhost:5341

## Configuración

Editar `FinanceManager.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=financemanager;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Secret": "your-super-secret-key-min-32-characters-long",
    "Issuer": "FinanceManagerAPI",
    "Audience": "FinanceManagerClient",
    "ExpirationHours": "24"
  }
}
```

## Migraciones de Base de Datos

La aplicación aplica migraciones automáticamente al iniciar. Para gestionar migraciones manualmente:

### Crear nueva migración

```bash
export TMPDIR=/tmp
dotnet ef migrations add <MigrationName> \
  --project FinanceManager.Infrastructure \
  --startup-project FinanceManager.API
```

### Aplicar migraciones

```bash
export TMPDIR=/tmp
dotnet ef database update \
  --project FinanceManager.Infrastructure \
  --startup-project FinanceManager.API
```

### Revertir migración

```bash
export TMPDIR=/tmp
dotnet ef database update <PreviousMigrationName> \
  --project FinanceManager.Infrastructure \
  --startup-project FinanceManager.API
```

## Uso de la API

### 1. Registrar Usuario

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

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "fullName": "John Doe",
    "defaultCurrency": "DOP"
  },
  "expiresAt": "2025-10-14T17:00:00Z"
}
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

### 3. Obtener Categorías (Requiere Autenticación)

```bash
curl -X GET http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Crear Cuenta Financiera

```bash
curl -X POST http://localhost:5000/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cuenta Corriente",
    "type": "Bank",
    "currency": "DOP",
    "initialBalance": 50000.00,
    "institution": "Banco Popular",
    "accountNumber": "****1234"
  }'
```

### 5. Crear Transacción

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "ACCOUNT_GUID_HERE",
    "categoryId": "CATEGORY_GUID_HERE",
    "type": "Expense",
    "amount": 1500.00,
    "currency": "DOP",
    "date": "2025-10-12",
    "description": "Supermercado",
    "paymentMethod": "Tarjeta de Crédito",
    "merchant": "La Sirena"
  }'
```

### 6. Listar Transacciones con Filtros

```bash
curl -X GET "http://localhost:5000/api/transactions?page=1&pageSize=20&startDate=2025-10-01&type=Expense" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Crear Presupuesto

```bash
curl -X POST http://localhost:5000/api/budgets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "CATEGORY_GUID_HERE",
    "period": "Monthly",
    "amount": 15000.00,
    "currency": "DOP",
    "startDate": "2025-10-01",
    "endDate": "2025-10-31",
    "alertThreshold80": true,
    "alertThreshold100": true
  }'
```

## Swagger UI (Recomendado)

La forma más fácil de probar la API es usando Swagger UI:

1. Ir a http://localhost:5000/swagger
2. Hacer clic en "Authorize" (botón verde con candado)
3. Ejecutar `/api/auth/register` o `/api/auth/login`
4. Copiar el token de la respuesta
5. En el diálogo de autorización, poner: `Bearer YOUR_TOKEN_HERE`
6. Ahora puedes ejecutar cualquier endpoint protegido

## Endpoints Disponibles

### Authentication
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Login y obtener JWT token

### Transactions (Requiere Auth)
- `GET /api/transactions` - Lista paginada con filtros
- `GET /api/transactions/{id}` - Detalle de transacción
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/{id}` - Actualizar transacción
- `DELETE /api/transactions/{id}` - Eliminar transacción

### Categories (Requiere Auth)
- `GET /api/categories` - Lista de categorías (incluye sistema + custom)
- `POST /api/categories` - Crear categoría personalizada

### Budgets (Requiere Auth)
- `GET /api/budgets` - Lista de presupuestos con cálculos
- `POST /api/budgets` - Crear presupuesto

### Accounts (Requiere Auth)
- `GET /api/accounts` - Lista de cuentas financieras
- `POST /api/accounts` - Crear cuenta financiera

## Features Implementados

### Authentication & Security
- Registro de usuarios con validación de email y password
- Login con JWT token generation
- Password hashing con BCrypt
- Token-based authentication en todos los endpoints protegidos
- Validación de ownership (usuarios solo acceden a sus recursos)

### Transactions
- CRUD completo
- Filtros avanzados: fecha, tipo, categoría, cuenta
- Paginación (max 100 items/página)
- Multi-currency support
- Exchange rates tracking

### Categories
- Categorías jerárquicas (parent-child)
- 13 categorías predefinidas (9 Expense + 4 Income)
- Categorías personalizadas por usuario
- Íconos emoji y colores

### Budgets
- Presupuestos por categoría
- Cálculos automáticos: spent, remaining, percentageUsed
- Alertas configurables (80%, 100%)
- Períodos: Monthly, Yearly, Custom

### Financial Accounts
- Múltiples tipos: Bank, CreditCard, Cash, DigitalWallet
- Balance tracking (initial + current)
- Multi-currency

### Infrastructure
- Logging estructurado con Serilog + Seq
- Global exception handling
- CORS habilitado para frontend
- Auto-migrations al iniciar
- Seed data automático

## Categorías Predefinidas

### Income (4)
- Salario
- Freelance
- Inversiones
- Otros Ingresos

### Expense (9)
- Alimentación
- Transporte
- Vivienda
- Salud
- Entretenimiento
- Educación
- Servicios
- Compras
- Otros Gastos

## Estructura de Errores

Todos los errores siguen este formato:

```json
{
  "statusCode": 400,
  "message": "Human-readable error message",
  "errors": [
    "Specific error detail 1",
    "Specific error detail 2"
  ]
}
```

**Status Codes**:
- `200` OK - Successful GET
- `201` Created - Successful POST
- `204` No Content - Successful DELETE
- `400` Bad Request - Validation error
- `401` Unauthorized - Missing/invalid token
- `404` Not Found - Resource not found
- `422` Unprocessable Entity - Business logic error
- `500` Internal Server Error - Unexpected error

## Logging

Los logs se envían a:
- **Console**: Salida estándar
- **Seq**: http://localhost:5341 (dashboard visual)

Niveles de log:
- `Information`: Operaciones exitosas
- `Warning`: Situaciones inesperadas
- `Error`: Errores de aplicación
- `Fatal`: Errores críticos

## Tecnologías

- **.NET 9**: Framework principal
- **Entity Framework Core 9**: ORM
- **PostgreSQL 16**: Base de datos
- **JWT Bearer**: Autenticación
- **BCrypt**: Password hashing
- **FluentValidation**: Validaciones
- **Serilog**: Logging
- **Seq**: Log aggregation
- **Swagger/OpenAPI**: Documentación API
- **Mapster**: Object mapping (opcional)

## Troubleshooting

### Error: "Cannot connect to PostgreSQL"
- Verificar que PostgreSQL esté corriendo: `docker ps`
- Verificar connection string en appsettings.json
- Verificar puerto 5432 disponible

### Error: "JWT Secret too short"
- El JWT Secret debe tener mínimo 32 caracteres
- Editar `Jwt:Secret` en appsettings.json

### Error: "dotnet ef command not found"
- Instalar: `dotnet tool install --global dotnet-ef`

### Error: "TMPDIR permission denied" (macOS)
- Usar: `export TMPDIR=/tmp` antes de comandos `dotnet ef`

## Desarrollo

### Agregar nueva entidad

1. Crear entidad en `FinanceManager.Core/Entities/`
2. Crear configuración en `FinanceManager.Infrastructure/Data/Configurations/`
3. Agregar DbSet en `ApplicationDbContext`
4. Crear migración: `dotnet ef migrations add AddNewEntity`
5. Aplicar: `dotnet ef database update`

### Agregar nuevo endpoint

1. Crear DTOs en `FinanceManager.API/DTOs/`
2. Crear validator en `FinanceManager.Core/Validators/` (si aplica)
3. Crear controller en `FinanceManager.API/Controllers/`
4. Registrar validator en `Program.cs` (si aplica)

## Contacto

Para más información, consultar:
- `/docs/backend/backend-architecture.md` - Arquitectura detallada
- `/docs/backend/implementation-log.md` - Log de implementación
- `/docs/api-contracts.md` - Contratos de API
