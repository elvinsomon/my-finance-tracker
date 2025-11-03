# Feature 03 - Simple Dashboard

**Estado**: ✅ Completado
**Prioridad**: Alta
**Complejidad**: Media
**Tiempo Estimado**: 2-3 días
**Tiempo Real**: 2 horas

---

## Objetivo

Dashboard principal que muestra balance actual, últimas transacciones y gráficos básicos de ingresos vs egresos.

---

## User Stories

1. Como usuario, quiero ver mi balance total al ingresar a la app
2. Como usuario, quiero ver las últimas 10 transacciones
3. Como usuario, quiero ver un gráfico de ingresos vs egresos del mes actual
4. Como usuario, quiero ver resúmenes por cuenta financiera
5. Como usuario, quiero acceso rápido a crear nueva transacción

---

## Componentes del Dashboard

### 1. Balance Overview (StatCards)
- **Total Balance**: Suma de todas las cuentas
- **Monthly Income**: Total ingresos del mes
- **Monthly Expenses**: Total gastos del mes
- **Monthly Savings**: Income - Expenses

### 2. Recent Transactions
- Últimas 10 transacciones
- Ordenadas por fecha (desc)
- Link a ver todas

### 3. Income vs Expense Chart
- Bar chart comparando últimos 6 meses
- Income (verde), Expenses (rojo)

### 4. Account Summary
- Lista de cuentas con balances
- Visual progress bars

---

## Especificación Técnica

### Backend

#### Controller: DashboardController

**Endpoints**:
- `GET /api/dashboard/summary` - Obtener resumen completo
- `GET /api/dashboard/recent-transactions?limit=10` - Últimas transacciones
- `GET /api/dashboard/monthly-stats?months=6` - Estadísticas mensuales

#### DTOs

**DashboardSummaryResponse**:
```json
{
  "totalBalance": 125430.50,
  "currency": "DOP",
  "monthlyIncome": 50000.00,
  "monthlyExpenses": 38250.00,
  "monthlySavings": 11750.00,
  "savingsRate": 23.5,
  "accounts": [
    {
      "id": "uuid",
      "name": "Tarjeta Visa",
      "balance": 45230.00,
      "currency": "DOP",
      "type": "CreditCard"
    },
    {
      "id": "uuid",
      "name": "Cuenta Corriente",
      "balance": 80200.50,
      "currency": "DOP",
      "type": "Checking"
    }
  ],
  "recentTransactions": [
    {
      "id": "uuid",
      "date": "2025-01-15",
      "description": "Supermercado Nacional",
      "amount": -1500.00,
      "categoryName": "Alimentación",
      "accountName": "Tarjeta Visa"
    }
  ],
  "monthlyStats": [
    {
      "month": "2025-01",
      "income": 50000,
      "expenses": 38250,
      "savings": 11750
    },
    {
      "month": "2024-12",
      "income": 48000,
      "expenses": 42100,
      "savings": 5900
    }
  ]
}
```

#### Service: DashboardService

```csharp
public class DashboardService
{
    public async Task<DashboardSummaryDto> GetSummaryAsync(Guid userId)
    {
        var accounts = await _accountRepository.GetByUserIdAsync(userId);
        var totalBalance = accounts.Sum(a => a.Balance);

        var currentMonth = DateTime.UtcNow;
        var startOfMonth = new DateTime(currentMonth.Year, currentMonth.Month, 1);

        var monthlyTransactions = await _transactionRepository
            .GetByUserAndDateRangeAsync(userId, startOfMonth, currentMonth);

        var monthlyIncome = monthlyTransactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.Amount);

        var monthlyExpenses = monthlyTransactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.Amount);

        return new DashboardSummaryDto
        {
            TotalBalance = totalBalance,
            MonthlyIncome = monthlyIncome,
            MonthlyExpenses = monthlyExpenses,
            MonthlySavings = monthlyIncome - monthlyExpenses,
            // ... más cálculos
        };
    }
}
```

### Frontend

#### Page: Dashboard.jsx

**Layout**:
```jsx
<div className="dashboard">
  <div className="stats-grid">
    <StatCard title="Total Balance" value={totalBalance} icon="💰" />
    <StatCard title="Monthly Income" value={monthlyIncome} icon="📈" color="green" />
    <StatCard title="Monthly Expenses" value={monthlyExpenses} icon="📉" color="red" />
    <StatCard title="Savings" value={monthlySavings} icon="🏦" color="blue" />
  </div>

  <div className="grid grid-cols-2 gap-6">
    <div className="chart-container">
      <h2>Income vs Expenses</h2>
      <BarChart data={monthlyStats} />
    </div>

    <div className="recent-transactions">
      <h2>Recent Transactions</h2>
      <TransactionList transactions={recentTransactions} />
      <Link to="/transactions">View All</Link>
    </div>
  </div>

  <div className="accounts-summary">
    <h2>Accounts Overview</h2>
    <AccountsSummaryTable accounts={accounts} />
  </div>

  <button className="fab" onClick={openTransactionModal}>
    + New Transaction
  </button>
</div>
```

#### Component: StatCard.jsx

```jsx
function StatCard({ title, value, icon, color = 'primary', trend }) {
  return (
    <div className={`stat-card bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-3xl font-bold mt-2">
            {formatCurrency(value)}
          </h3>
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
            </p>
          )}
        </div>
        <span className="text-5xl opacity-20">{icon}</span>
      </div>
    </div>
  );
}
```

#### Component: IncomeExpenseChart.jsx

```jsx
import { Bar } from 'react-chartjs-2';

function IncomeExpenseChart({ data }) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: data.map(d => d.income),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Expenses',
        data: data.map(d => d.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}
```

---

## Reglas de Negocio

1. **Multi-Currency**: Si usuario tiene cuentas en diferentes monedas, convertir a moneda base
2. **Real-Time**: Balance debe reflejar cambios inmediatos al crear transacciones
3. **Performance**: Dashboard debe cargar en <2 segundos
4. **Date Range**: Stats por defecto muestran mes actual
5. **Empty State**: Mostrar mensaje motivador si no hay transacciones

---

## Performance Optimizations

1. **Caching**: Cache de summary por 5 minutos
2. **Pagination**: Recent transactions limitadas a 10
3. **Eager Loading**: Cargar transactions con categories/accounts
4. **Database Indexes**: Índices en UserId + Date para queries rápidas
5. **Computed Fields**: Pre-calcular totales en DB

---

## Testing

### Backend Tests

```csharp
[Fact]
public async Task GetDashboardSummary_ReturnsCorrectBalance()
{
    // Arrange
    var userId = Guid.NewGuid();
    // Seed accounts with balances: 10000, 5000

    // Act
    var result = await _dashboardService.GetSummaryAsync(userId);

    // Assert
    Assert.Equal(15000, result.TotalBalance);
}

[Fact]
public async Task GetDashboardSummary_CalculatesCorrectSavingsRate()
{
    // Arrange - Income: 10000, Expenses: 7000

    // Act
    var result = await _dashboardService.GetSummaryAsync(userId);

    // Assert
    Assert.Equal(30, result.SavingsRate); // (10000-7000)/10000 * 100
}
```

### Frontend Tests

```javascript
describe('Dashboard', () => {
  it('renders all stat cards', () => {
    render(<Dashboard />);

    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('Monthly Income')).toBeInTheDocument();
    expect(screen.getByText('Monthly Expenses')).toBeInTheDocument();
    expect(screen.getByText('Savings')).toBeInTheDocument();
  });

  it('displays recent transactions', async () => {
    const mockTransactions = [
      { id: '1', description: 'Test 1', amount: -100 },
      { id: '2', description: 'Test 2', amount: -200 }
    ];

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test 1')).toBeInTheDocument();
      expect(screen.getByText('Test 2')).toBeInTheDocument();
    });
  });
});
```

---

## Archivos Creados/Modificados

### Backend (4 archivos)
- `FinanceManager.API/Controllers/DashboardController.cs`
- `FinanceManager.API/Services/DashboardService.cs`
- `FinanceManager.API/DTOs/Responses/DashboardSummaryResponse.cs`
- `FinanceManager.Core/Interfaces/Services/IDashboardService.cs`

### Frontend (6 archivos)
- `src/pages/Dashboard.jsx`
- `src/components/StatCard.jsx`
- `src/components/IncomeExpenseChart.jsx`
- `src/components/RecentTransactionsList.jsx`
- `src/components/AccountsSummaryTable.jsx`
- `src/services/dashboardService.js`

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                    Hello, Elvin!  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐│
│  │💰 Total     │ │📈 Income    │ │📉 Expenses  │ │🏦 Save ││
│  │   Balance   │ │   (Jan)     │ │   (Jan)     │ │  (Jan) ││
│  │             │ │             │ │             │ │        ││
│  │ RD$125,430  │ │ RD$50,000   │ │ RD$38,250   │ │RD$11,7 ││
│  │   ↑ 5.2%    │ │   ↑ 4.2%    │ │   ↓ 7.5%    │ │↑ 98.8% ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘│
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐ ┌───────────────────────────┐│
│  │ Income vs Expenses       │ │ Recent Transactions       ││
│  │                          │ │                           ││
│  │  [Bar Chart showing 6    │ │ Jan 15 - Supermercado    ││
│  │   months of income in    │ │ Alimentación    -RD$1,500││
│  │   green bars and         │ │                           ││
│  │   expenses in red bars]  │ │ Jan 14 - Salary          ││
│  │                          │ │ Income        +RD$50,000  ││
│  │                          │ │                           ││
│  │                          │ │ Jan 13 - Uber            ││
│  │                          │ │ Transport       -RD$350   ││
│  │                          │ │                           ││
│  │                          │ │ [View All →]             ││
│  └──────────────────────────┘ └───────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Accounts Overview                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Tarjeta Visa         RD$45,230  [████████░░] 36%       ││
│  │ Cuenta Corriente     RD$80,200  [██████████] 64%       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                                             [+ New Transaction]
```

---

**Última Actualización**: 2025-10-10
**Estado**: Feature completada y validada
**Dependencias**: Features 01, 02
