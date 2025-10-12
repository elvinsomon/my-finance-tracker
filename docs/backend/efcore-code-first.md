# ADR-002: Enfoque Code-First con Entity Framework Core

## Contexto
Para el desarrollo de la base de datos, debíamos elegir entre:
- **Database-First**: Diseñar esquema SQL primero, luego generar entidades
- **Code-First**: Definir entidades en C#, luego generar esquema SQL

## Decisión
Se ha decidido usar **Code-First** con Entity Framework Core.

## Justificación

### Ventajas del Code-First
1. **Control total desde el código**: Las entidades se definen en C# con strong typing
2. **Migraciones automáticas**: EF Core genera migraciones basadas en cambios del modelo
3. **Mejor integración con flujo de desarrollo**: Los cambios se hacen en código, no en SQL scripts
4. **Versionamiento**: Las migraciones se versionan en Git
5. **Rollback sencillo**: `dotnet ef database update <migration>` permite volver atrás
6. **Configuración Fluent API**: Control granular de configuraciones en C#
7. **Seed data en código**: Los datos iniciales se manejan desde código

### Flujo de Trabajo
```bash
# 1. Crear/modificar entidades en FinanceManager.Core
# 2. Configurar entidades en Infrastructure/Data/Configurations
# 3. Generar migración
dotnet ef migrations add InitialCreate --project FinanceManager.Infrastructure --startup-project FinanceManager.API

# 4. Aplicar migración
dotnet ef database update --project FinanceManager.Infrastructure --startup-project FinanceManager.API

# 5. Rollback si es necesario
dotnet ef database update PreviousMigration --project FinanceManager.Infrastructure --startup-project FinanceManager.API
```

## Consecuencias

### Positivas
- ✅ Migraciones versionadas y rastreables
- ✅ Facilita trabajo en equipo (conflictos de merge más fáciles de resolver)
- ✅ Rollback y upgrade de schema sencillos
- ✅ Seed data centralizado en código
- ✅ Strong typing y IntelliSense

### Negativas
- ❌ Migraciones pueden volverse complejas
- ❌ Performance de queries generadas puede no ser óptima (solucionable con SQL raw cuando sea necesario)
- ❌ Requiere conocimiento de EF Core y Fluent API

## Configuración Aplicada

### DbContext
- `ApplicationDbContext` en `FinanceManager.Infrastructure/Data`
- Configuraciones separadas por entidad en carpeta `Configurations`
- `SaveChangesAsync` override para auto-actualizar `CreatedAt`/`UpdatedAt`

### Fluent API
- Configuraciones explícitas para columnas, índices, relaciones
- Uso de `IEntityTypeConfiguration<T>` para separar configuraciones
- Aplicación automática con `ApplyConfigurationsFromAssembly`

## Referencia al Esquema Original
El diagrama ER en `docs/db-diagram.md` se usó como base, pero las entidades se definen en código C# y la base de datos se genera a partir de ellas.

## Referencias
- [EF Core Code-First](https://docs.microsoft.com/en-us/ef/core/modeling/)
- [EF Core Migrations](https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
