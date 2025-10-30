# Changelog - MyFinanceTracker

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.7.0] - 2025-10-25

### ✅ Completado

#### Feature 4 - CSV Import (Fases 2 y 3)

**Fase 2: Duplicate Detection**
- Implementado algoritmo de 3 etapas: Exact reference → Date+Amount → Fuzzy (Levenshtein)
- Agregado `DuplicateDetectionService` con cálculo de similitud al 80%
- DTOs actualizados: `DuplicateStatus`, `ExistingTransactionId`, `DuplicateReason`
- Frontend: Badges (New/Likely/Confirmed), filtros, override checkboxes
- Tiempo: ~1 hora

**Fase 3: Auto-Categorization**
- Implementado `CategoryRuleEngine` con 5 tipos de pattern matching
- Agregado `CategoryRuleSeeder` con 37 reglas predefinidas (17 RD + 20 España)
- CRUD completo: `CategoryRulesController` (5 endpoints)
- Pattern matching con OR logic usando pipes (`|`)
- Confidence scoring: Base 0.70 + bonuses (hasta 1.00)
- Priority-based evaluation (1-100)
- Frontend: CategoryRules page + RuleModal
- Migración: `AddCategoryRulesAndAutoSuggestions`
- Tiempo: ~2.5 horas

### 🐛 Fixed

#### Issue #1: Database Seeding Error
- **Error**: `The property 'CategoryRule.CreatedAt' could not be found`
- **Fix**: `ApplicationDbContext.SaveChangesAsync()` ahora maneja `CreatedAt` y `CreatedDate`
- **Archivo**: `ApplicationDbContext.cs` (líneas 60-83)

#### Issue #2: Auto-Categorization Not Working
- **Error**: Reglas del sistema no se consultaban
- **Fix**: Agregado systemUserId al query en `CategoryRuleEngine`
- **Archivo**: `CategoryRuleEngine.cs` (líneas 31-41)

#### Issue #3: Pipe-Separated Patterns Not Working
- **Error**: Patterns como `"SUPERM|NACIONAL|SIRENA"` no funcionaban
- **Fix**: Implementado split y evaluación individual en `EvaluateRule()`
- **Archivo**: `CategoryRuleEngine.cs` (líneas 78-99)

### 📝 Documentation

- Creado `docs/PROJECT-STATUS.md` - Estado completo del proyecto
- Creado `docs/README.md` - Índice de toda la documentación
- Creado `docs/CHANGELOG.md` - Este archivo
- Actualizado `docs/phase2-plan.md` con progreso de Feature 4
- Actualizado `docs/feature4-csv-import-specification.md` con fixes

### 🏗️ Backend

**Archivos Creados (13):**
- `CategoryRule.cs` (entity)
- `CategoryRuleConfiguration.cs` (EF config)
- `ICategoryRuleRepository.cs` (interface)
- `CategoryRuleRepository.cs` (implementation)
- `CategoryRuleEngine.cs` (service)
- `CategoryRuleSeeder.cs` (37 predefined rules)
- `CategoryRulesController.cs` (5 endpoints)
- `DuplicateDetectionService.cs` (3-stage algorithm)
- `CategoryRuleRequest.cs` (DTO)
- `CategoryRuleResponse.cs` (DTO)
- `DuplicateStatus.cs` (enum)
- `RuleMatchType.cs` (enum)
- Migration: `AddCategoryRulesAndAutoSuggestions`

**Archivos Modificados (4):**
- `ApplicationDbContext.cs` - Handle CreatedDate/CreatedAt
- `ImportService.cs` - Integración de servicios
- `DataSeeder.cs` - Llamada a CategoryRuleSeeder
- `Program.cs` - Registro de servicios en DI

### 🎨 Frontend

**Archivos Creados (6):**
- `CategoryRules.jsx` - Management page
- `RuleModal.jsx` - Create/Edit modal
- `categoryRuleService.js` - API integration

**Archivos Modificados (3):**
- `CsvPreviewTable.jsx` - Badges y filtros
- `Navbar.jsx` - Link a CategoryRules
- `App.jsx` - Route para CategoryRules

### 📊 Metrics

- Total archivos creados: Backend (13), Frontend (6)
- Total archivos modificados: Backend (4), Frontend (3)
- Líneas de código: ~2,500 LOC
- Build status: ✅ 0 errores, 1 warning
- Tiempo de implementación: 5.5 horas

---

## [0.6.0] - 2025-10-24

### ✅ Completado

#### Feature 4 - CSV Import (Fase 1: MVP Básico)

- Upload CSV con drag-and-drop (max 10MB)
- Parsers para APAP y Vimenca
- Auto-detección de banco (90% accuracy)
- Preview con 20 primeras transacciones
- Selector de moneda obligatorio (DOP/USD/EUR)
- Import básico a FinancialAccount
- Validación de transacciones
- Import history básico
- Migración: `AddImportBasicFields`
- Tiempo: ~2 horas

### 🏗️ Backend

**Archivos Creados (15):**
- `ImportHistory.cs` (entity)
- `IImportHistoryRepository.cs` + implementation
- `ImportsController.cs` (3 endpoints)
- `ImportService.cs` (orchestration)
- `ApapCsvParser.cs`
- `VimencaCsvParser.cs`
- `CsvParserFactory.cs`
- `ICsvParser.cs` (interface)
- 4 DTOs (UploadCsvResponse, ImportedTransactionDto, etc.)
- Migration: `AddImportBasicFields`

### 🎨 Frontend

**Archivos Creados (6):**
- `Import.jsx` - Main page
- `CsvPreviewTable.jsx` - Preview component
- `importService.js` - API integration

---

## [0.5.0] - 2025-10-18

### ✅ Completado

#### Feature 2: Reports Avanzados
- 5 tipos de reportes con visualizaciones (Chart.js)
- Endpoints: Spending by Category, Trends, Comparison, Cashflow, Top Expenses
- Tiempo: ~1 hora

#### Feature 3: Transaction Items
- Desglose de transacciones en ítems individuales
- Validaciones: suma items == amount total
- Auto-cálculo de totalAmount
- Migración: `AddTransactionItems`
- Tiempo: ~1 hora

---

## [0.4.0] - 2025-10-14

### ✅ Completado

#### Feature 1: Savings Goals
- Sistema completo de metas de ahorro
- 5-tier progress indicator
- Proyecciones automáticas
- 8 endpoints API
- Migración: `AddSavingsGoals`
- Tiempo: ~2 horas

---

## [0.3.0] - 2025-10-10

### ✅ Completado

#### Fase 1: MVP Core
- Authentication (JWT)
- Financial Accounts
- Categories (hierarchical)
- Transactions
- Budgets
- Tiempo: ~8 horas

---

## [0.2.0] - 2025-10-05

### 🏗️ Setup Inicial

- Configuración de Docker (PostgreSQL, Seq)
- Layered architecture (Core, Infrastructure, API)
- Entity Framework Code-First
- Migraciones iniciales
- JWT authentication setup
- CORS configuration
- Serilog + Seq logging
- React + Vite + Tailwind setup

---

## [0.1.0] - 2025-10-01

### 🎬 Inicio del Proyecto

- Creación del repositorio
- Estructura inicial de directorios
- Documentación inicial (mvp-plan.md, stack.md)
- README.md

---

## Leyenda de Tipos de Cambios

- ✅ **Completado** - Nuevas features implementadas
- 🐛 **Fixed** - Bugs corregidos
- 📝 **Documentation** - Cambios en documentación
- 🏗️ **Backend** - Cambios en backend
- 🎨 **Frontend** - Cambios en frontend
- 🔧 **Infrastructure** - Cambios en infraestructura
- ⚠️ **Deprecated** - Features deprecadas
- 🗑️ **Removed** - Features removidas
- 🔒 **Security** - Fixes de seguridad
- 📊 **Metrics** - Métricas y estadísticas

---

**Última Actualización:** 2025-10-25 18:30
**Mantenido por:** Elvin Somon
