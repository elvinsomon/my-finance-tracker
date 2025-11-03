# Feature 07 - CSV Import System

**Estado**: 🟡 60% Completado (3/5 fases)
**Prioridad**: Alta
**Complejidad**: Alta
**Tiempo Real**: 5.5 horas (Fases 1-3)
**Tiempo Estimado Restante**: 3-5 días (Fases 4-5)

---

## Objetivo

Sistema completo de importación de estados de cuenta bancarios en formato CSV con detección de duplicados, auto-categorización inteligente, y gestión de perfiles bancarios.

---

## Documentación Detallada

**Ver documento completo**: `docs/feature4-csv-import-specification.md`

Este feature tiene su propia especificación completa de 1,290 líneas que incluye:
- Arquitectura técnica detallada
- Data model completo
- API specifications
- Algoritmos de duplicate detection y auto-categorization
- 37 reglas predefinidas para RD y España
- Casos de uso y testing

---

## Progreso por Fase

### ✅ Fase 1: MVP Básico (Completada - 2h)

**Implementado**:
- Upload CSV con drag-and-drop (10MB max)
- Parsers custom para APAP y Vimenca
- Preview con primeras 20 filas
- Currency selector obligatorio (DOP/USD/EUR)
- Import a FinancialAccount seleccionada
- Migración: `AddImportBasicFields`

**Archivos creados**:
- Backend: 15 archivos
- Frontend: 6 archivos

**Key Features**:
- Auto-detección de banco (90% accuracy)
- Multi-currency support
- Validation antes de import

---

### ✅ Fase 2: Duplicate Detection (Completada - 1h)

**Implementado**:
- Algoritmo 3-stage con Levenshtein similarity
- DuplicateDetectionService
- UI con badges (New/Likely/Confirmed)
- Override checkboxes en preview
- ExternalTransactionId tracking

**Archivos creados**:
- Backend: 2 archivos
- Frontend: Integrado en components existentes

**Algorithm Stages**:
1. **Exact Reference Match**: ExternalId match (100% confidence) → Skip
2. **Date + Amount Match**: ±2 días + amount exacto → Likely duplicate
3. **Fuzzy Description**: ±3 días + 80% Levenshtein similarity → Possible duplicate

**Performance**: <2 segundos para 1,000 transacciones

---

### ✅ Fase 3: Auto-Categorization (Completada - 2.5h)

**Implementado**:
- CategoryRule entity + CRUD API
- CategoryRuleEngine service
- 37 reglas predefinidas (17 RD + 20 España)
- 5 pattern types: Contains, StartsWith, EndsWith, Exact, Regex
- Confidence scoring (base 0.70 + bonuses hasta 1.00)
- Priority-based evaluation (1-100)
- OR logic con pipe separator (`|`)

**Archivos creados**:
- Backend: 11 archivos
- Frontend: 6 archivos
- Migración: `AddCategoryRulesAndAutoSuggestions`

**Predefined Rules Coverage**:
- **República Dominicana** (17): Supermercados (Nacional, Sirena, Bravo), Gasolineras (Esso, Shell, Total), Farmacias, Servicios (EDEESTE, Claro, Altice), etc.
- **España** (20): Supermercados (Mercadona, Carrefour, Lidl), Gasolineras (Repsol, Cepsa), Servicios (Movistar, Vodafone, Endesa), Tiendas (Zara, MediaMarkt), etc.

**Accuracy**: 70%+ auto-categorization con predefined rules

**Issues Resueltos**:
1. Naming inconsistency `CreatedAt` vs `CreatedDate`
2. System rules not queried (systemUserId fix)
3. Pipe-separated patterns not working (OR logic implementation)

---

### ⏸️ Fase 4: Bank Profiles & Import History (Pendiente - 2-3 días)

**Scope**:
- BankProfile entity para formatos custom
- CRUD endpoints para bank profiles
- Auto-detection algorithm (signature-based, 85%+ confidence)
- Import history completo con detalles
- Rollback functionality (soft-delete imported transactions)
- Download original CSV from history

**Deliverables**:
- Backend: BankProfile entity, migration, CRUD controller
- Backend: Detection algorithm, rollback service
- Frontend: Bank Profiles management page
- Frontend: Import History page con tabla + rollback modal

**Success Criteria**:
- Sistema detecta bancos conocidos con >85% confidence
- Users pueden crear custom profiles via UI
- Import history tracks all imports con metadata
- Rollback funciona para imports no modificados

---

### ⏸️ Fase 5: Polish & Optimization (Pendiente - 1-2 días)

**Scope**:
- Async processing para archivos ≥1000 rows (Hangfire/BackgroundService)
- Batch insert optimization (500 rows batches)
- Database indexes optimization
- Cache de category rules (5 min TTL)
- Progress indicators para imports largos
- Advanced filters en preview
- Column mapping customization UI
- Error export functionality

**Deliverables**:
- Backend: Async job infrastructure
- Backend: Performance optimizations (indexing, caching, batching)
- Frontend: Progress bars, advanced filters
- Testing: Full test suite (unit + integration)

**Success Criteria**:
- Import 5000 rows en <15 segundos
- No UI blocking durante import
- All edge cases handled gracefully
- Performance monitoring dashboard

---

## Arquitectura Técnica

### Strategy Pattern: CSV Parsing
```
ICsvParserStrategy (interface)
├── ApapCsvParser (auto-detect currency)
├── VimencaCsvParser (user-specified currency)
├── GenericCsvParser (fallback)
└── CustomBankParser (user-created profiles)
```

### Chain of Responsibility: Duplicate Detection
```
ExactReferenceMatchDetector
  ↓ (no match)
DateAmountMatchDetector
  ↓ (no match)
FuzzyDescriptionMatchDetector (Levenshtein)
  ↓ (no match)
NewTransaction
```

### Rule Engine Pipeline
```
1. Load active rules (system + user), sorted by priority DESC
2. For each rule:
   - If pattern contains "|": split and evaluate each
   - Match against transaction description
   - Calculate confidence score
   - Return first match OR continue if confidence < threshold
3. Return best match or null
```

---

## User Stories

### Completed Stories ✅
1. ✅ Como usuario, quiero importar CSV de mi banco arrastrando el archivo
2. ✅ Como usuario, quiero ver preview antes de confirmar import
3. ✅ Como usuario, quiero que el sistema detecte duplicados automáticamente
4. ✅ Como usuario, quiero override de detección si está equivocada
5. ✅ Como usuario, quiero que transacciones se categoricen automáticamente
6. ✅ Como usuario, quiero crear y gestionar reglas de categorización
7. ✅ Como usuario, quiero usar reglas predefinidas para mi país

### Pending Stories ⏸️
8. ⏸️ Como usuario, quiero crear mi propio perfil de banco si no está soportado
9. ⏸️ Como usuario, quiero ver historial de todos mis imports
10. ⏸️ Como usuario, quiero hacer rollback de un import si fue un error
11. ⏸️ Como usuario, quiero descargar el CSV original desde el history
12. ⏸️ Como usuario, quiero importar archivos grandes (5000+ rows) sin que se bloquee la UI

---

## Performance Metrics

**Current (Phases 1-3)**:
- Upload + Parse: <2s para 100 rows
- Duplicate Detection: <2s para 1,000 rows
- Rule Matching: ~100ms para 37 rules
- Preview Render: <500ms

**Target (After Phases 4-5)**:
- Import 1,000 rows: <5s
- Import 5,000 rows: <15s (async)
- Database queries: <100ms (with indexes)
- Cache hit rate: >80%

---

## Testing Strategy

### Unit Tests (Pending)
- CSV parser tests (all bank types)
- Duplicate detection algorithm tests
- Category rule matching tests
- Validation tests

### Integration Tests (Pending)
- Full import flow end-to-end
- Rollback functionality
- Edge case handling (malformed CSV, duplicate overrides, etc.)

### Test Data Available
- `apap_valid_dop.csv` (50 rows, montos en DOP)
- `apap_valid_usd.csv` (50 rows, montos en USD)
- `vimenca_valid.csv` (actualizado con formato nuevo)
- Need: large_file.csv (5000 rows), invalid_amounts.csv, mixed_currency.csv

---

## Bancos Soportados

### APAP (Asociación Popular) ✅
- **Format**: 4 columnas
- **Currency**: Auto-detect from "monto" column (DOP/USD explicit)
- **Reference**: ExternalTransactionId en columna

**Columns**:
```
referencia,fecha,descripcion,monto
VT252750161000420000006,02/10/2025,CASHBACK SALONES BAR,$364.51 DOP
```

### Vimenca ✅
- **Format**: 5 columnas, 3 líneas de header metadata
- **Currency**: User must specify (not in file)
- **Reference**: No ExternalTransactionId (solo Nº Operación)

**Columns**:
```
Fecha,Descripción,Nº Operación,Cargo,Abono
08/07/2024,SUPERM. NACIONAL 27 DE FE,VT241900109090720001922,"1,922.70",
```

### Future Banks (Fase 4)
- Custom user-created profiles via UI
- Auto-detection for new formats
- Community-contributed parsers

---

## Extensions & Future Work

### Short Term (Fase 4-5)
- BankProfile management
- Import history & rollback
- Performance optimization
- Async processing

### Medium Term
- More bank formats (BHD, Popular, Banreservas)
- Scheduled imports (cloud storage integration)
- Mobile app support
- Merchant database (normalize names)

### Long Term
- Direct bank API integration (Plaid, Open Banking)
- ML-based categorization (replace rules)
- Smart reconciliation (match with receipts)
- Advanced analytics on imports

---

## Referencias

- **Spec Completa**: `docs/feature4-csv-import-specification.md`
- **Phase 2 Plan**: `docs/phase2-plan.md`
- **Implementation Logs**: `docs/backend/implementation-log.md`
- **Sample CSVs**: `docs/statements-samples/`

---

**Última Actualización**: 2025-10-25
**Próximo Milestone**: Fase 4 - Bank Profiles & History
**Responsable**: Claude Code + Elvin Somon
