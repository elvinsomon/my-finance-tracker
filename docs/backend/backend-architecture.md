# Arquitectura Backend - MyFinanceTracker

## Visión General

El backend de MyFinanceTracker sigue una **arquitectura en capas (Layered Architecture)** con separación clara de responsabilidades, implementando patrones como Repository, Unit of Work y Dependency Injection.

## Estructura de Proyectos

```
backend/
├── FinanceManager.sln
├── FinanceManager.API/          # Capa de Presentación (Web API)
├── FinanceManager.Core/         # Capa de Dominio
└── FinanceManager.Infrastructure/  # Capa de Infraestructura
```

## Capas

### 1. FinanceManager.Core (Dominio)

**Propósito**: Contiene la lógica de negocio, entidades del dominio, interfaces y reglas de validación.

**Responsabilidades**:
- Modelos/Entidades del dominio
- Interfaces de repositorios
- Interfaces de servicios
- Validaciones con FluentValidation
- Excepciones de negocio
- Enums y constantes

**No depende** de ninguna otra capa (independiente).

**Estructura**:
```
FinanceManager.Core/
├── Entities/              # Entidades del dominio
│   ├── User.cs
│   ├── Transaction.cs
│   ├── Category.cs
│   ├── Budget.cs
│   └── ...
├── Interfaces/
│   ├── Repositories/      # Interfaces de repositorios
│   └── Services/          # Interfaces de servicios
├── Validators/            # Validadores FluentValidation
├── Exceptions/            # Excepciones de negocio
└── Enums/                 # Enumeraciones
```

### 2. FinanceManager.Infrastructure (Infraestructura)

**Propósito**: Implementa el acceso a datos, servicios externos y preocupaciones técnicas.

**Responsabilidades**:
- DbContext de Entity Framework Core
- Configuraciones de entidades (Fluent API)
- Implementación de repositorios
- Implementación de Unit of Work
- Migraciones de base de datos
- Seed data
- Servicios de infraestructura (email, storage, etc.)

**Depende de**: `FinanceManager.Core`

**Estructura**:
```
FinanceManager.Infrastructure/
├── Data/
│   ├── ApplicationDbContext.cs
│   ├── Configurations/        # Configuraciones EF Core
│   └── Migrations/            # Migraciones automáticas
├── Repositories/              # Implementaciones de repositorios
│   ├── GenericRepository.cs
│   ├── TransactionRepository.cs
│   └── ...
├── UnitOfWork/
│   └── UnitOfWork.cs
└── Seeders/                   # Datos iniciales
    └── DataSeeder.cs
```

### 3. FinanceManager.API (Presentación)

**Propósito**: Expone endpoints REST, maneja requests/responses HTTP, autenticación y autorización.

**Responsabilidades**:
- Controllers (REST API endpoints)
- DTOs (Data Transfer Objects)
- Mapeos con Mapster
- Configuración de middleware
- Autenticación JWT
- Configuración de Swagger/OpenAPI
- Logging con Serilog
- Manejo global de excepciones
- Filtros y validaciones de entrada

**Depende de**: `FinanceManager.Core` y `FinanceManager.Infrastructure`

**Estructura**:
```
FinanceManager.API/
├── Controllers/               # API Controllers
│   ├── AuthController.cs
│   ├── TransactionsController.cs
│   ├── CategoriesController.cs
│   └── ...
├── DTOs/                      # Data Transfer Objects
│   ├── Requests/
│   └── Responses/
├── Mappings/                  # Configuración Mapster
├── Middleware/                # Middleware personalizados
├── Filters/                   # Action/Exception filters
├── Services/                  # Servicios de aplicación
└── Program.cs                 # Configuración startup
```

## Patrones Implementados

### Repository Pattern

Abstrae el acceso a datos, proporcionando una interfaz limpia para operaciones CRUD.

**Interfaz genérica** (FinanceManager.Core):
```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}
```

**Implementación** (FinanceManager.Infrastructure):
```csharp
public class GenericRepository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;

    // Implementación...
}
```

### Unit of Work Pattern

Agrupa múltiples operaciones de repositorio en una sola transacción.

```csharp
public interface IUnitOfWork : IDisposable
{
    ITransactionRepository Transactions { get; }
    ICategoryRepository Categories { get; }
    // ... más repositorios

    Task<int> SaveChangesAsync();
}
```

### Dependency Injection

Todos los servicios, repositorios y dependencias se registran en el contenedor DI.

```csharp
// Program.cs
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
```

## Flujo de Datos

1. **Request HTTP** → Controller (API)
2. **Controller** → Valida DTO y mapea a entidad del dominio
3. **Service** → Ejecuta lógica de negocio
4. **Repository** → Accede a la base de datos
5. **Response** → Mapea entidad a DTO y retorna JSON

```
[Cliente] → [Controller] → [Service] → [Repository] → [DbContext] → [PostgreSQL]
                ↓            ↓            ↓
              [DTO]     [Validación]   [Entidad]
```

## Manejo de Errores

### Exception Middleware

Captura excepciones globalmente y retorna respuestas consistentes.

```csharp
{
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Detail 1", "Detail 2"]
}
```

### Excepciones Personalizadas

- `NotFoundException`: Recurso no encontrado (404)
- `ValidationException`: Validación fallida (400)
- `UnauthorizedException`: No autorizado (401)
- `BusinessException`: Error de lógica de negocio (422)

## Autenticación y Autorización

### JWT (JSON Web Tokens)

- **Endpoint de login**: `POST /api/auth/login`
- **Token lifetime**: Configurable vía appsettings (default: 24h)
- **Header**: `Authorization: Bearer <token>`

### Flujo de Autenticación

1. Usuario envía credenciales a `/api/auth/login`
2. API valida credenciales
3. Si es válido, genera JWT con claims (userId, email, roles)
4. Cliente almacena token y lo incluye en requests subsecuentes
5. Middleware valida token en cada request protegido

## Configuración

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=financemanager;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Secret": "your-secret-key-min-32-chars",
    "Issuer": "FinanceManagerAPI",
    "Audience": "FinanceManagerClient",
    "ExpirationHours": 24
  },
  "Serilog": {
    "WriteTo": [
      { "Name": "Console" },
      { "Name": "Seq", "Args": { "serverUrl": "http://localhost:5341" } }
    ]
  }
}
```

## Logging con Serilog + Seq

**Configuración**:
```csharp
builder.Host.UseSerilog((context, config) =>
{
    config.ReadFrom.Configuration(context.Configuration)
          .WriteTo.Console()
          .WriteTo.Seq("http://localhost:5341");
});
```

**Niveles de log**:
- `Information`: Operaciones exitosas
- `Warning`: Situaciones inesperadas pero manejables
- `Error`: Errores de aplicación
- `Fatal`: Errores críticos que detienen la aplicación

**Acceso a Seq**: http://localhost:5341

## Mapeo con Mapster

**Configuración global**:
```csharp
builder.Services.AddMapster();
```

**Ejemplo de mapeo**:
```csharp
// En Controller
var transaction = request.Adapt<Transaction>();
var response = transaction.Adapt<TransactionResponse>();
```

**Configuración personalizada**:
```csharp
TypeAdapterConfig<Transaction, TransactionResponse>
    .NewConfig()
    .Map(dest => dest.CategoryName, src => src.Category.Name);
```

## Validación

### FluentValidation

**Ejemplo de validador**:
```csharp
public class CreateTransactionValidator : AbstractValidator<CreateTransactionRequest>
{
    public CreateTransactionValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than zero");

        RuleFor(x => x.Date)
            .NotEmpty()
            .LessThanOrEqualTo(DateTime.UtcNow);
    }
}
```

**Registro**:
```csharp
builder.Services.AddValidatorsFromAssemblyContaining<CreateTransactionValidator>();
```

## Testing (Futuro)

### Pruebas Unitarias
- xUnit para testing framework
- Moq para mocking
- FluentAssertions para assertions

### Pruebas de Integración
- WebApplicationFactory para testing de API
- Testcontainers para PostgreSQL en tests

## Mejores Prácticas

1. **Separación de responsabilidades**: Cada capa tiene un propósito único
2. **Inyección de dependencias**: Usar interfaces, no implementaciones concretas
3. **Async/Await**: Todas las operaciones de I/O son asíncronas
4. **Logging estructurado**: Usar Serilog con propiedades estructuradas
5. **Manejo centralizado de errores**: Exception middleware global
6. **Validación en múltiples niveles**: DTOs, entidades y lógica de negocio
7. **Código limpio**: Nombres descriptivos, métodos pequeños, SOLID principles

## Referencias

- [ADR-001: Layered Architecture](../decisions/adr-001-layered-architecture.md)
- [ADR-002: Code-First Approach](../decisions/adr-002-code-first-approach.md)
- [API Endpoints Documentation](api-endpoints.md)
- [Database Schema](../database/schema-design.md)
