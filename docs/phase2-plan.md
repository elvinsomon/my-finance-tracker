# Fase 2 - Plan de Implementación

## Objetivo
Funcionalidades avanzadas de gestión y análisis financiero

**Duración estimada**: 4-6 semanas
**Estado**: 🚧 En progreso

---

## 📋 Features a Implementar (En orden)

### 1. ✅ Metas de Ahorro (Prioridad Alta) - COMPLETADO
**Objetivo**: Permitir a usuarios crear y trackear metas de ahorro

**Backend**:
- [x] Entity: SavingsGoal (creado)
- [x] Entity: SavingsContribution (creado)
- [x] Controller: `SavingsGoalsController` (8 endpoints)
- [x] Service: `SavingsGoalsService` (cálculos y proyecciones)
- [x] Repository: `ISavingsGoalRepository` (implementado)
- [x] Migration: `20251014122025_AddSavingsGoals` (aplicada)

**Frontend**:
- [x] Page: `SavingsGoals.jsx` (listado con progress bars)
- [x] Modal: `GoalModal.jsx` (crear/editar con icon/color pickers)
- [x] Modal: `ContributeModal.jsx` (agregar contribuciones)
- [x] Page: `GoalDetails.jsx` (detalle con historial)
- [x] Service: `savingsGoalService.js` (7 métodos API)
- [x] Component: `GoalProgressCard.jsx` (con 5-tier color coding)

**Estado**: ✅ Completado el 2025-10-14
**Tiempo real**: 2 horas (estimación: 1-1.5 semanas)

---

### 2. ✅ Reportes Avanzados (Prioridad Alta)
**Objetivo**: Análisis avanzado de finanzas con múltiples visualizaciones

**Backend**:
- [ ] Controller: `ReportsController`
- [ ] Service: `ReportsService` (agregaciones y análisis)
- [ ] Endpoints:
  - [ ] GET `/api/reports/spending-by-category`
  - [ ] GET `/api/reports/trends`
  - [ ] GET `/api/reports/comparison`
  - [ ] GET `/api/reports/cashflow`
  - [ ] GET `/api/reports/top-expenses`

**Frontend**:
- [ ] Page: `Reports.jsx` (tabs con diferentes reportes)
- [ ] Component: `SpendingPieChart.jsx`
- [ ] Component: `TrendsLineChart.jsx`
- [ ] Component: `ComparisonChart.jsx`
- [ ] Component: `CashflowChart.jsx`
- [ ] Service: `reportsService.js`

**Estimación**: 1.5 semanas

---

### 3. ✅ Transaction Items (Prioridad Media)
**Objetivo**: Desglose de transacciones en items individuales

**Backend**:
- [ ] Entity: TransactionItem (ya existe en schema)
- [ ] Update: TransactionsController (incluir items en CRUD)
- [ ] Update: TransactionResponse DTO (incluir items)
- [ ] Repository: Update TransactionRepository

**Frontend**:
- [ ] Update: `TransactionModal.jsx` (agregar tabla de items)
- [ ] Component: `ItemsTable.jsx` (editable)
- [ ] Service: Update `transactionService.js`

**Estimación**: 1 semana

---

### 4. ⏸️ Importación de CSV (En espera)
**Estado**: NO INICIAR SIN AUTORIZACIÓN
**Razón**: Detalles por definir con el usuario

---

## 📝 Contratos API (Definidos)

### Savings Goals API

#### GET `/api/savings-goals`
**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Vacaciones 2026",
    "description": "Viaje a Europa",
    "targetAmount": 50000,
    "currency": "DOP",
    "currentAmount": 15000,
    "targetDate": "2026-06-01",
    "priority": 1,
    "status": "Active",
    "icon": "✈️",
    "color": "#3b82f6",
    "isEmergencyFund": false,
    "percentageComplete": 30.0,
    "projectedCompletionDate": "2026-05-15",
    "monthlyContributionNeeded": 2916.67,
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

#### POST `/api/savings-goals`
**Request**:
```json
{
  "name": "Vacaciones 2026",
  "description": "Viaje a Europa",
  "targetAmount": 50000,
  "currency": "DOP",
  "targetDate": "2026-06-01",
  "priority": 1,
  "icon": "✈️",
  "color": "#3b82f6",
  "isEmergencyFund": false
}
```

#### POST `/api/savings-goals/{id}/contribute`
**Request**:
```json
{
  "transactionId": "uuid",
  "amount": 5000,
  "notes": "Ahorro mensual enero"
}
```

#### GET `/api/savings-goals/{id}/contributions`
**Response**:
```json
[
  {
    "id": "uuid",
    "goalId": "uuid",
    "transactionId": "uuid",
    "amount": 5000,
    "date": "2025-01-15",
    "notes": "Ahorro mensual enero",
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

---

### Reports API

#### GET `/api/reports/spending-by-category?startDate=2025-01-01&endDate=2025-01-31`
**Response**:
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "categories": [
    {
      "categoryId": "uuid",
      "categoryName": "Alimentación",
      "totalAmount": 15000,
      "percentage": 35.5,
      "transactionCount": 25,
      "color": "#f97316"
    }
  ],
  "totalSpending": 42300
}
```

#### GET `/api/reports/trends?months=12`
**Response**:
```json
{
  "months": [
    {
      "month": "2024-10",
      "income": 50000,
      "expenses": 38000,
      "savings": 12000,
      "netCashflow": 12000
    }
  ],
  "averageMonthlyIncome": 48500,
  "averageMonthlyExpenses": 36200,
  "averageMonthlySavings": 12300
}
```

#### GET `/api/reports/comparison?period=month&currentStart=2025-01-01&currentEnd=2025-01-31&previousStart=2024-12-01&previousEnd=2024-12-31`
**Response**:
```json
{
  "current": {
    "period": "2025-01",
    "income": 50000,
    "expenses": 38000,
    "savings": 12000
  },
  "previous": {
    "period": "2024-12",
    "income": 48000,
    "expenses": 40000,
    "savings": 8000
  },
  "changes": {
    "incomeChange": 2000,
    "incomeChangePercentage": 4.17,
    "expensesChange": -2000,
    "expensesChangePercentage": -5.0,
    "savingsChange": 4000,
    "savingsChangePercentage": 50.0
  }
}
```

#### GET `/api/reports/cashflow?year=2025`
**Response**:
```json
{
  "year": 2025,
  "months": [
    {
      "month": "2025-01",
      "income": 50000,
      "expenses": 38000,
      "netCashflow": 12000,
      "cumulativeCashflow": 12000
    }
  ],
  "totalIncome": 600000,
  "totalExpenses": 456000,
  "totalNetCashflow": 144000
}
```

#### GET `/api/reports/top-expenses?startDate=2025-01-01&endDate=2025-01-31&limit=10`
**Response**:
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "topExpenses": [
    {
      "transactionId": "uuid",
      "date": "2025-01-15",
      "description": "Supermercado La Sirena",
      "amount": 8500,
      "categoryName": "Alimentación",
      "accountName": "Tarjeta de Crédito"
    }
  ],
  "totalAmount": 42300
}
```

---

### Transaction Items API

#### GET `/api/transactions/{id}` (Updated)
**Response** (incluye items):
```json
{
  "id": "uuid",
  "accountId": "uuid",
  "categoryId": "uuid",
  "type": "Expense",
  "amount": 3500,
  "currency": "DOP",
  "date": "2025-01-15",
  "description": "Supermercado",
  "items": [
    {
      "id": "uuid",
      "categoryId": "uuid",
      "categoryName": "Alimentación",
      "description": "Leche",
      "quantity": 2,
      "unitPrice": 150,
      "totalAmount": 300,
      "notes": null
    },
    {
      "id": "uuid",
      "categoryId": "uuid",
      "categoryName": "Hogar",
      "description": "Detergente",
      "quantity": 1,
      "unitPrice": 250,
      "totalAmount": 250,
      "notes": null
    }
  ],
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### POST/PUT `/api/transactions` (Updated)
**Request** (incluye items):
```json
{
  "accountId": "uuid",
  "categoryId": "uuid",
  "type": "Expense",
  "amount": 3500,
  "currency": "DOP",
  "date": "2025-01-15",
  "description": "Supermercado",
  "items": [
    {
      "categoryId": "uuid",
      "description": "Leche",
      "quantity": 2,
      "unitPrice": 150,
      "totalAmount": 300
    }
  ]
}
```

---

## 🎯 Estrategia de Implementación

### Fase 2.1: Metas de Ahorro
1. **Backend Agent**: Crear entities, controllers, services, repositories
2. **Frontend Agent**: Crear páginas, componentes, servicios
3. **Integración**: Probar flujo completo
4. **Documentación**: Actualizar docs

### Fase 2.2: Reportes Avanzados
1. **Backend Agent**: Crear controller con todos los endpoints de reportes
2. **Frontend Agent**: Crear página de reportes con múltiples gráficos
3. **Integración**: Verificar precisión de cálculos
4. **Documentación**: Actualizar docs

### Fase 2.3: Transaction Items
1. **Backend Agent**: Actualizar TransactionsController y DTOs
2. **Frontend Agent**: Actualizar TransactionModal con tabla de items
3. **Integración**: Probar CRUD con items
4. **Documentación**: Actualizar docs

---

## 📊 Tracking de Progreso

### Sprint 1: Metas de Ahorro
- **Inicio**: 2025-10-14
- **Fin**: 2025-10-14
- **Estado**: ✅ Completado
- **Archivos creados**: Backend (13), Frontend (7)
- **Migración**: Aplicada exitosamente
- **Deployment**: Docker containers actualizados

### Sprint 2: Reportes Avanzados
- **Inicio**: 2025-10-26
- **Fin estimado**: 2025-11-08
- **Estado**: ⚪ Pendiente

### Sprint 3: Transaction Items
- **Inicio**: 2025-11-09
- **Fin estimado**: 2025-11-15
- **Estado**: ⚪ Pendiente

### Sprint 4: Polish & Testing
- **Inicio**: 2025-11-16
- **Fin estimado**: 2025-11-22
- **Estado**: ⚪ Pendiente

---

## ✅ Checklist General

### Antes de cada feature:
- [ ] Definir contrato API
- [ ] Actualizar este documento
- [ ] Crear entidades si no existen
- [ ] Definir DTOs

### Durante implementación:
- [ ] Backend: Tests unitarios (opcional)
- [ ] Frontend: Validaciones de formularios
- [ ] Integración: Probar end-to-end
- [ ] Documentación: Actualizar implementation logs

### Después de cada feature:
- [ ] Code review
- [ ] Testing manual
- [ ] Actualizar README si es necesario
- [ ] Commit con mensaje descriptivo

---

**Última actualización**: 2025-10-14
**Responsable**: Claude Code + Usuario
