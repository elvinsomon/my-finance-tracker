# ADR-001: Arquitectura en Capas (Layered Architecture)

## Estado
Aceptado

## Contexto
MyFinanceTracker requiere una arquitectura que permita:
- Separación clara de responsabilidades
- Facilidad de mantenimiento y testing
- Escalabilidad futura
- Independencia del dominio de negocio respecto a infraestructura

## Decisión
Se ha decidido implementar una **arquitectura en capas** con los siguientes proyectos:

### FinanceManager.Core (Capa de Dominio)
- **Responsabilidad**: Lógica de negocio, entidades, interfaces
- **Dependencias**: Ninguna
- **Contiene**: Entidades, interfaces de repositorios/servicios, validadores, excepciones

### FinanceManager.Infrastructure (Capa de Infraestructura)
- **Responsabilidad**: Acceso a datos, servicios externos
- **Dependencias**: FinanceManager.Core
- **Contiene**: DbContext, implementación de repositorios, migraciones, seed data

### FinanceManager.API (Capa de Presentación)
- **Responsabilidad**: Endpoints REST, autenticación, manejo de requests/responses
- **Dependencias**: FinanceManager.Core, FinanceManager.Infrastructure
- **Contiene**: Controllers, DTOs, middleware, configuración

## Consecuencias

### Positivas
- ✅ Separación de responsabilidades (SRP - SOLID)
- ✅ Core independiente de infraestructura (testeable sin BD)
- ✅ Facilita cambios en infraestructura sin afectar lógica de negocio
- ✅ Estructura familiar para desarrolladores .NET
- ✅ Facilita testing unitario

### Negativas
- ❌ Más proyectos que mantener
- ❌ Overhead inicial en configuración
- ❌ Puede ser over-engineering para proyectos muy pequeños

## Alternativas Consideradas

### Clean Architecture (Onion Architecture)
**Rechazada**: Demasiado compleja para un MVP. Requiere más capas (Application, Domain, etc.)

### Arquitectura Monolítica (Todo en un proyecto)
**Rechazada**: Dificulta el testing y mantenimiento a largo plazo

## Referencias
- [Microsoft - Common web application architectures](https://docs.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
