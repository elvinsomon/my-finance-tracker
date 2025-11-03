# Feature 05 - Monthly Budgets

**Estado**: ✅ Completado
**Prioridad**: Alta
**Complejidad**: Media
**Tiempo Estimado**: 1-2 días
**Tiempo Real**: 1.5 horas

---

## Objetivo

Sistema de presupuestos mensuales por categoría con tracking de consumo e indicadores visuales de progreso.

---

## User Stories

1. Como usuario, quiero definir un presupuesto mensual para cada categoría
2. Como usuario, quiero ver el progreso de consumo de cada presupuesto
3. Como usuario, quiero recibir alertas cuando esté cerca del límite
4. Como usuario, quiero ver histórico de cumplimiento de presupuestos
5. Como usuario, quiero copiar presupuestos del mes anterior

---

## Especificación Técnica

### Backend

#### Entity: Budget

```csharp
public class Budget
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } // DOP, USD, EUR
    public int Month { get; set; } // 1-12
    public int Year { get; set; }
    public DateTime StartDate { get; set; } // First day of month
    public DateTime EndDate { get; set; } // Last day of month

    // Tracking
    public decimal SpentAmount { get; set; } // Calculated
    public decimal RemainingAmount { get; set; } // Calculated
    public decimal PercentageUsed { get; set; } // Calculated

    // Alerts
    public bool AlertAt75Percent { get; set; }
    public bool AlertAt90Percent { get; set; }
    public bool Has75PercentAlertSent { get; set; }
    public bool Has90PercentAlertSent { get; set; }

    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation
    public User User { get; set; }
    public Category Category { get; set; }
}
```

#### Controller: BudgetsController

**Endpoints**:
- `GET /api/budgets?month=1&year=2025` - Listar presupuestos del mes
- `GET /api/budgets/{id}` - Obtener detalle
- `POST /api/budgets` - Crear presupuesto
- `PUT /api/budgets/{id}` - Actualizar presupuesto
- `DELETE /api/budgets/{id}` - Eliminar presupuesto
- `POST /api/budgets/copy?fromMonth=12&fromYear=2024&toMonth=1&toYear=2025` - Copiar presupuestos
- `GET /api/budgets/summary?month=1&year=2025` - Resumen del mes

#### DTOs

**BudgetRequest**:
```json
{
  "categoryId": "uuid",
  "amount": 5000.00,
  "currency": "DOP",
  "month": 1,
  "year": 2025,
  "alertAt75Percent": true,
  "alertAt90Percent": true
}
```

**BudgetResponse**:
```json
{
  "id": "uuid",
  "categoryId": "uuid",
  "categoryName": "Alimentación",
  "categoryIcon": "🍔",
  "categoryColor": "#10b981",
  "amount": 5000.00,
  "spentAmount": 3250.00,
  "remainingAmount": 1750.00,
  "percentageUsed": 65.0,
  "currency": "DOP",
  "month": 1,
  "year": 2025,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "status": "OnTrack",
  "daysRemaining": 15,
  "alertAt75Percent": true,
  "alertAt90Percent": true,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

**BudgetSummaryResponse**:
```json
{
  "month": 1,
  "year": 2025,
  "totalBudgeted": 50000.00,
  "totalSpent": 38250.00,
  "totalRemaining": 11750.00,
  "overallPercentage": 76.5,
  "budgets": [
    {
      "categoryName": "Alimentación",
      "amount": 5000,
      "spentAmount": 3250,
      "status": "OnTrack"
    }
  ],
  "categoriesOverBudget": 2,
  "categoriesOnTrack": 8,
  "categoriesUnderBudget": 0
}
```

#### Service: BudgetService

```csharp
public class BudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly ITransactionRepository _transactionRepository;

    public async Task UpdateBudgetProgressAsync(Guid budgetId)
    {
        var budget = await _budgetRepository.GetByIdAsync(budgetId);

        var transactions = await _transactionRepository
            .GetByCategoryAndDateRangeAsync(
                budget.UserId,
                budget.CategoryId,
                budget.StartDate,
                budget.EndDate);

        var spentAmount = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        budget.SpentAmount = spentAmount;
        budget.RemainingAmount = budget.Amount - spentAmount;
        budget.PercentageUsed = (spentAmount / budget.Amount) * 100;

        await _budgetRepository.UpdateAsync(budget);

        // Check alerts
        await CheckAndSendAlertsAsync(budget);
    }

    private async Task CheckAndSendAlertsAsync(Budget budget)
    {
        if (budget.AlertAt75Percent &&
            !budget.Has75PercentAlertSent &&
            budget.PercentageUsed >= 75)
        {
            await _notificationService.SendBudgetAlertAsync(
                budget.UserId,
                $"You've used 75% of your {budget.Category.Name} budget");

            budget.Has75PercentAlertSent = true;
        }

        if (budget.AlertAt90Percent &&
            !budget.Has90PercentAlertSent &&
            budget.PercentageUsed >= 90)
        {
            await _notificationService.SendBudgetAlertAsync(
                budget.UserId,
                $"WARNING: You've used 90% of your {budget.Category.Name} budget");

            budget.Has90PercentAlertSent = true;
        }
    }

    public async Task<List<Budget>> CopyBudgetsToNextMonthAsync(
        Guid userId,
        int fromMonth,
        int fromYear,
        int toMonth,
        int toYear)
    {
        var sourceBudgets = await _budgetRepository
            .GetByUserAndPeriodAsync(userId, fromMonth, fromYear);

        var newBudgets = new List<Budget>();

        foreach (var source in sourceBudgets)
        {
            var newBudget = new Budget
            {
                UserId = userId,
                CategoryId = source.CategoryId,
                Amount = source.Amount,
                Currency = source.Currency,
                Month = toMonth,
                Year = toYear,
                StartDate = new DateTime(toYear, toMonth, 1),
                EndDate = new DateTime(toYear, toMonth, DateTime.DaysInMonth(toYear, toMonth)),
                AlertAt75Percent = source.AlertAt75Percent,
                AlertAt90Percent = source.AlertAt90Percent,
                IsActive = true
            };

            newBudgets.Add(newBudget);
        }

        await _budgetRepository.AddRangeAsync(newBudgets);
        return newBudgets;
    }
}
```

### Frontend

#### Page: Budgets.jsx

**Features**:
- Lista de budgets del mes actual
- Progress bars con código de colores
- Botones: Create, Edit, Delete, Copy from previous month
- Month/Year selector

#### Component: BudgetCard.jsx

```jsx
function BudgetCard({ budget }) {
  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'red';
    if (percentage >= 90) return 'orange';
    if (percentage >= 75) return 'yellow';
    return 'green';
  };

  const statusColor = getStatusColor(budget.percentageUsed);

  return (
    <div className="budget-card bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{budget.categoryIcon}</span>
          <div>
            <h3 className="font-bold">{budget.categoryName}</h3>
            <p className="text-sm text-gray-500">
              {formatCurrency(budget.spentAmount)} of {formatCurrency(budget.amount)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold text-${statusColor}-500`}>
            {budget.percentageUsed.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">
            {budget.daysRemaining} days left
          </p>
        </div>
      </div>

      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute h-full bg-${statusColor}-500 transition-all duration-300`}
          style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-600">
          Remaining: {formatCurrency(budget.remainingAmount)}
        </span>
        <span className={`font-medium text-${statusColor}-600`}>
          {budget.percentageUsed >= 100 ? 'Over Budget' :
           budget.percentageUsed >= 90 ? 'Critical' :
           budget.percentageUsed >= 75 ? 'Warning' : 'On Track'}
        </span>
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onEdit} className="btn-sm btn-secondary">Edit</button>
        <button onClick={onDelete} className="btn-sm btn-danger">Delete</button>
      </div>
    </div>
  );
}
```

#### Component: BudgetModal.jsx

```jsx
function BudgetModal({ isOpen, onClose, onSave, budget = null }) {
  const [formData, setFormData] = useState({
    categoryId: budget?.categoryId || '',
    amount: budget?.amount || '',
    currency: budget?.currency || 'DOP',
    month: budget?.month || new Date().getMonth() + 1,
    year: budget?.year || new Date().getFullYear(),
    alertAt75Percent: budget?.alertAt75Percent ?? true,
    alertAt90Percent: budget?.alertAt90Percent ?? true
  });

  // ... form handling logic

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={budget ? 'Edit Budget' : 'New Budget'}>
      <form onSubmit={handleSubmit}>
        <CategorySelector
          value={formData.categoryId}
          onChange={(value) => setFormData({ ...formData, categoryId: value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
          />

          <CurrencySelector
            value={formData.currency}
            onChange={(value) => setFormData({ ...formData, currency: value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Month"
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            options={monthOptions}
          />

          <Input
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Checkbox
            label="Alert at 75% usage"
            checked={formData.alertAt75Percent}
            onChange={(e) => setFormData({ ...formData, alertAt75Percent: e.target.checked })}
          />

          <Checkbox
            label="Alert at 90% usage"
            checked={formData.alertAt90Percent}
            onChange={(e) => setFormData({ ...formData, alertAt90Percent: e.target.checked })}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {budget ? 'Update' : 'Create'} Budget
          </button>
        </div>
      </form>
    </Modal>
  );
}
```

---

## Reglas de Negocio

1. **Unique Budget**: Solo un budget por categoría por mes
2. **Auto-Update**: SpentAmount se actualiza automáticamente al crear/editar transacciones
3. **Alert Timing**: Alertas se envían una sola vez cuando se cruza el threshold
4. **Currency Match**: Budget usa la misma moneda que las transacciones de la categoría
5. **End of Month**: Budgets no utilizados no se transfieren al mes siguiente

---

## Casos Edge

1. **Budget Overrun**: Permitir gastar más del presupuesto, mostrar en rojo
2. **Mid-Month Budget Creation**: Calcular progreso desde inicio del mes
3. **Category Deletion**: Mantener budgets históricos aunque categoría esté inactiva
4. **Zero Budget**: Permitir budget = 0 para categorías que se quieren monitorear sin límite

---

## Testing

```csharp
[Fact]
public async Task UpdateBudgetProgress_CalculatesCorrectPercentage()
{
    // Arrange
    var budget = new Budget { Amount = 5000, CategoryId = catId };
    // Create transactions totaling 3250

    // Act
    await _budgetService.UpdateBudgetProgressAsync(budget.Id);

    // Assert
    Assert.Equal(3250, budget.SpentAmount);
    Assert.Equal(1750, budget.RemainingAmount);
    Assert.Equal(65, budget.PercentageUsed);
}

[Fact]
public async Task CopyBudgets_CreatesNewBudgetsForNextMonth()
{
    // Arrange - 5 budgets in January

    // Act
    var newBudgets = await _budgetService.CopyBudgetsToNextMonthAsync(
        userId, 1, 2025, 2, 2025);

    // Assert
    Assert.Equal(5, newBudgets.Count);
    Assert.All(newBudgets, b => Assert.Equal(2, b.Month));
    Assert.All(newBudgets, b => Assert.Equal(0, b.SpentAmount));
}
```

---

## Archivos Creados/Modificados

### Backend (6 archivos)
- `FinanceManager.Core/Entities/Budget.cs`
- `FinanceManager.Core/Interfaces/Repositories/IBudgetRepository.cs`
- `FinanceManager.Infrastructure/Repositories/BudgetRepository.cs`
- `FinanceManager.API/Controllers/BudgetsController.cs`
- `FinanceManager.API/Services/BudgetService.cs`
- `FinanceManager.API/DTOs/Requests/BudgetRequest.cs`

### Frontend (4 archivos)
- `src/pages/Budgets.jsx`
- `src/components/BudgetCard.jsx`
- `src/components/BudgetModal.jsx`
- `src/services/budgetService.js`

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  Budgets - January 2025          [Copy from Dec] [+ New]    │
├─────────────────────────────────────────────────────────────┤
│  Summary:  RD$38,250 / RD$50,000  (76.5%)  🟢 On Track     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🍔 Alimentación                       65.0%   15 days  ││
│  │ RD$3,250 of RD$5,000                                   ││
│  │ [████████████████████░░░░░░░░] 🟢 On Track            ││
│  │ Remaining: RD$1,750                    [Edit] [Delete] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🚗 Transporte                         92.5%   15 days  ││
│  │ RD$3,700 of RD$4,000                                   ││
│  │ [███████████████████████████░] 🟠 Critical             ││
│  │ Remaining: RD$300                      [Edit] [Delete] ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 🎮 Entretenimiento                    105.0%  15 days  ││
│  │ RD$2,100 of RD$2,000                                   ││
│  │ [████████████████████████████████] 🔴 Over Budget      ││
│  │ Over by: RD$100                        [Edit] [Delete] ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

**Última Actualización**: 2025-10-10
**Estado**: Feature completada
**Dependencias**: Feature 01 (Transactions), Feature 02 (Categories)
