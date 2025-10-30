# MyFinanceTracker - Documentación

Bienvenido a la documentación técnica de MyFinanceTracker. Este directorio contiene toda la información necesaria para entender, desarrollar y mantener el proyecto.

---

## 📚 Índice de Documentos

### 🎯 Documentos Principales

#### [PROJECT-STATUS.md](./PROJECT-STATUS.md) 🌟
**Estado actual del proyecto completo**
- Resumen ejecutivo con progreso global (70%)
- Features implementados por fase
- Issues críticos resueltos con soluciones
- Stack tecnológico detallado
- Métricas del proyecto
- Próximos pasos y roadmap
- Lecciones aprendidas

📌 **Léelo primero si quieres saber dónde está el proyecto ahora**

---

#### [phase2-plan.md](./phase2-plan.md)
**Plan de implementación de Fase 2 (Expansión)**
- 4 features principales con desglose completo
- Contratos API documentados
- Tracking de progreso por sprint
- Checklist de tareas
- Issues resueltos con detalles técnicos
- Próximos pasos detallados

📌 **Documento de trabajo principal para desarrollo**

---

#### [feature4-csv-import-specification.md](./feature4-csv-import-specification.md)
**Especificación completa del sistema de importación CSV**
- 5 fases de implementación (3 completadas)
- Problema statement y contexto de negocio
- Requisitos funcionales detallados
- Arquitectura técnica (Strategy, Factory patterns)
- Contratos API completos
- Algoritmos core (duplicate detection, auto-categorization)
- 37 reglas predefinidas (RD + España)

📌 **Referencia técnica para Feature 4**

---

### 📋 Documentos de Planificación

#### [mvp-plan.md](./mvp-plan.md)
**Plan original del MVP**
- Features Fase 1, 2 y 3
- Priorización y estimaciones
- Criterios de éxito

#### [functional-requirements.md](./functional-requirements.md)
**Requisitos funcionales del sistema**
- Casos de uso
- User stories
- Reglas de negocio

#### [non-functional-requirements.md](./non-functional-requirements.md)
**Requisitos no funcionales**
- Performance targets
- Seguridad
- Escalabilidad

---

### 🏗️ Documentos de Arquitectura

#### Backend

- **[backend/backend-architecture.md](./backend/backend-architecture.md)**
  - Layered architecture (Core, Infrastructure, API)
  - Patrones utilizados (Repository, UnitOfWork)
  - Estructura de proyectos

- **[backend/layered-architecture.md](./backend/layered-architecture.md)**
  - Detalles de cada capa
  - Dependencias y flujo de datos

- **[backend/efcore-code-first.md](./backend/efcore-code-first.md)**
  - Entity Framework Code-First approach
  - Migraciones y configuraciones

- **[backend/implementation-log.md](./backend/implementation-log.md)**
  - Log cronológico de implementación backend
  - Decisiones técnicas

#### Frontend

- **[frontend/component-library.md](./frontend/component-library.md)**
  - Componentes reutilizables
  - Props y ejemplos de uso

- **[frontend/routing.md](./frontend/routing.md)**
  - Configuración de rutas
  - Protección de rutas

- **[frontend/ui-decisions.md](./frontend/ui-decisions.md)**
  - Decisiones de diseño
  - Tailwind CSS patterns

- **[frontend/api-integration.md](./frontend/api-integration.md)**
  - Servicios API
  - Manejo de errores

- **[frontend/implementation-log.md](./frontend/implementation-log.md)**
  - Log cronológico de implementación frontend

#### Infrastructure

- **[infrastructure/database-squema.md](./infrastructure/database-squema.md)**
  - Diagrama completo de base de datos
  - Relaciones entre entidades

- **[infrastructure/docker-deployment.md](./infrastructure/docker-deployment.md)**
  - Configuración de Docker
  - Multi-stage builds

- **[infrastructure/docker-services.md](./infrastructure/docker-services.md)**
  - PostgreSQL, Seq
  - Docker Compose

- **[infrastructure/setup.md](./infrastructure/setup.md)**
  - Setup inicial del ambiente
  - Comandos útiles

- **[infrastructure/implementation-log.md](./infrastructure/implementation-log.md)**
  - Log de configuración de infraestructura

---

### 📖 Documentos Técnicos

#### [api-contracts.md](./api-contracts.md)
**Contratos completos de la API**
- Todos los endpoints documentados
- Request/Response examples
- Códigos de error

#### [stack.md](./stack.md)
**Stack tecnológico**
- Backend: .NET 9, EF Core, PostgreSQL
- Frontend: React, Vite, Tailwind
- Infrastructure: Docker, Seq

---

## 🗂️ Estructura de Documentación

```
docs/
├── README.md                           # Este archivo
├── PROJECT-STATUS.md                   # ⭐ Estado actual del proyecto
├── phase2-plan.md                      # ⭐ Plan de Fase 2 (documento de trabajo)
├── feature4-csv-import-specification.md # ⭐ Spec de CSV Import
│
├── mvp-plan.md                         # Plan MVP original
├── functional-requirements.md          # Requisitos funcionales
├── non-functional-requirements.md      # Requisitos no funcionales
├── api-contracts.md                    # Contratos API
├── stack.md                            # Stack tecnológico
│
├── backend/                            # Documentos de backend
│   ├── backend-architecture.md
│   ├── layered-architecture.md
│   ├── efcore-code-first.md
│   └── implementation-log.md
│
├── frontend/                           # Documentos de frontend
│   ├── component-library.md
│   ├── routing.md
│   ├── ui-decisions.md
│   ├── api-integration.md
│   └── implementation-log.md
│
└── infrastructure/                     # Documentos de infraestructura
    ├── database-squema.md
    ├── docker-deployment.md
    ├── docker-services.md
    ├── setup.md
    └── implementation-log.md
```

---

## 🚀 Quick Start

### Para entender el estado actual
1. Lee **[PROJECT-STATUS.md](./PROJECT-STATUS.md)**
2. Revisa **[phase2-plan.md](./phase2-plan.md)** sección "Próximos Pasos"

### Para trabajar en CSV Import
1. Lee **[feature4-csv-import-specification.md](./feature4-csv-import-specification.md)**
2. Revisa **[phase2-plan.md](./phase2-plan.md)** sección "Feature 4"

### Para entender la arquitectura
1. Lee **[backend/backend-architecture.md](./backend/backend-architecture.md)**
2. Lee **[backend/layered-architecture.md](./backend/layered-architecture.md)**
3. Revisa **[infrastructure/database-squema.md](./infrastructure/database-squema.md)**

### Para trabajar en frontend
1. Lee **[frontend/component-library.md](./frontend/component-library.md)**
2. Revisa **[frontend/api-integration.md](./frontend/api-integration.md)**

### Para setup inicial
1. Lee **[infrastructure/setup.md](./infrastructure/setup.md)**
2. Revisa **[infrastructure/docker-services.md](./infrastructure/docker-services.md)**

---

## 📊 Estado por Fase

| Fase | Progreso | Documentación |
|------|----------|---------------|
| **Fase 1: MVP** | ✅ 100% | [mvp-plan.md](./mvp-plan.md) |
| **Fase 2: Expansión** | ✅ 100% | [phase2-plan.md](./phase2-plan.md) |
| **Fase 3: Inteligencia** | ⏸️ 0% | Pendiente |

---

## 🔍 Búsqueda Rápida

### Buscar por Tema

**Autenticación y Seguridad:**
- [api-contracts.md](./api-contracts.md) → Auth endpoints
- [backend/backend-architecture.md](./backend/backend-architecture.md) → JWT implementation

**Base de Datos:**
- [infrastructure/database-squema.md](./infrastructure/database-squema.md) → Schema completo
- [backend/efcore-code-first.md](./backend/efcore-code-first.md) → Migraciones

**Importación CSV:**
- [feature4-csv-import-specification.md](./feature4-csv-import-specification.md) → Spec completa
- [phase2-plan.md](./phase2-plan.md) → Feature 4 section

**Reportes:**
- [phase2-plan.md](./phase2-plan.md) → Feature 2 section
- [api-contracts.md](./api-contracts.md) → Reports API

**Savings Goals:**
- [phase2-plan.md](./phase2-plan.md) → Feature 1 section
- [api-contracts.md](./api-contracts.md) → Savings Goals API

---

## 📝 Convenciones de Documentación

### Formato
- Todos los documentos en **Markdown**
- Headings en español
- Code blocks con syntax highlighting
- Tablas para información estructurada

### Estado de Features
- ✅ Completado
- 🔄 En Progreso
- ⏸️ Pendiente
- ❌ Cancelado
- 🐛 Bug conocido

### Prioridades
- 🔴 Alta
- 🟠 Media
- 🟢 Baja

---

## 🔄 Actualización de Documentación

### Cuándo Actualizar

**Siempre actualizar:**
- Al completar una feature
- Al resolver un bug crítico
- Al cambiar arquitectura
- Al agregar/modificar endpoints API

**Documentos a actualizar:**
1. **[PROJECT-STATUS.md](./PROJECT-STATUS.md)** - Para cambios en estado general
2. **[phase2-plan.md](./phase2-plan.md)** - Para progreso de features
3. **Feature-specific docs** - Para detalles técnicos
4. **[api-contracts.md](./api-contracts.md)** - Para cambios en API

### Template de Update

```markdown
**Última actualización**: YYYY-MM-DD HH:MM
**Responsable**: Nombre
**Versión**: X.Y

**Cambios:**
- [x] Item completado
- [ ] Item pendiente
```

---

## 💡 Tips de Navegación

### VSCode
- Usa `Ctrl+P` → `README.md` para buscar rápido
- Instala extensión "Markdown All in One"
- Preview con `Ctrl+Shift+V`

### Terminal
```bash
# Ver estructura
tree docs/

# Buscar en documentos
grep -r "palabra" docs/

# Abrir en VSCode
code docs/README.md
```

---

## 🤝 Contribuciones

Al agregar documentación:
1. Sigue las convenciones de formato
2. Actualiza este README si agregas nuevo documento
3. Mantén enlaces internos funcionando
4. Usa lenguaje claro y conciso

---

**Documentación generada por:** Claude Code + Elvin Somon
**Última actualización:** 2025-10-25
**Versión:** 1.0
