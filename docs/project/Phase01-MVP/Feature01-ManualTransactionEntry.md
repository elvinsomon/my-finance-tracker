# Feature 01 - Manual Transaction Entry

**Estado**: ✅ Completado
**Prioridad**: Alta
**Complejidad**: Media
**Tiempo Estimado**: 3-4 días
**Tiempo Real**: 2 horas

---

## Objetivo

Permitir a los usuarios registrar transacciones manualmente con toda la información necesaria: monto, fecha, descripción, categoría, y cuenta asociada.

---

## User Stories

1. Como usuario, quiero registrar una transacción de ingreso o gasto manualmente
2. Como usuario, quiero editar transacciones que registré previamente
3. Como usuario, quiero eliminar transacciones incorrectas
4. Como usuario, quiero ver el listado de todas mis transacciones con filtros
5. Como usuario, quiero buscar transacciones por descripción o categoría

---

## Especificación Técnica

### Backend

#### Entity: Transaction

```csharp
public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }

    public TransactionType Type { get; set; } // Income, Expense
    public decimal Amount { get; set; }
    public string Currency { get; set; } // DOP, USD, EUR
    public DateTime Date { get; set; }
    public string Description { get; set; }
    public string Notes { get; set; }

    public bool IsRecurring { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; }
    public FinancialAccount Account { get; set; }
    public Category Category { get; set; }
    public ICollection<Tag> Tags { get; set; }
}

public enum TransactionType
{
    Income = 0,
    Expense = 1
}
```

#### Controller: TransactionsController

**Endpoints**:
- `GET /api/transactions` - Listar transacciones con paginación y filtros
- `GET /api/transactions/{id}` - Obtener detalle de transacción
- `POST /api/transactions` - Crear nueva transacción
- `PUT /api/transactions/{id}` - Actualizar transacción
- `DELETE /api/transactions/{id}` - Eliminar transacción (soft delete)
- `GET /api/transactions/summary` - Obtener resumen (total income/expense)

#### DTOs

**TransactionRequest**:
```json
{
  "accountId": "uuid",
  "categoryId": "uuid",
  "type": "Expense",
  "amount": 1500.50,
  "currency": "DOP",
  "date": "2025-01-15",
  "description": "Supermercado Nacional",
  "notes": "Compra semanal",
  "tagIds": ["uuid1", "uuid2"]
}
```

**TransactionResponse**:
```json
{
  "id": "uuid",
  "accountId": "uuid",
  "accountName": "Tarjeta Visa",
  "categoryId": "uuid",
  "categoryName": "Alimentación",
  "type": "Expense",
  "amount": 1500.50,
  "currency": "DOP",
  "date": "2025-01-15",
  "description": "Supermercado Nacional",
  "notes": "Compra semanal",
  "tags": [
    {"id": "uuid1", "name": "Groceries"},
    {"id": "uuid2", "name": "Essential"}
  ],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

#### Validaciones (FluentValidation)

```csharp
public class TransactionRequestValidator : AbstractValidator<TransactionRequest>
{
    public TransactionRequestValidator()
    {
        RuleFor(x => x.AccountId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be greater than 0");
        RuleFor(x => x.Currency)
            .NotEmpty()
            .Must(c => new[] { "DOP", "USD", "EUR" }.Contains(c))
            .WithMessage("Currency must be DOP, USD, or EUR");
        RuleFor(x => x.Date)
            .NotEmpty()
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1))
            .WithMessage("Date cannot be in the future");
        RuleFor(x => x.Description)
            .NotEmpty()
            .MaximumLength(200);
    }
}
```

### Frontend

#### Page: Transactions.jsx

**Features**:
- Listado de transacciones en tabla
- Paginación (20 items por página)
- Filtros: fecha, categoría, tipo, cuenta
- Búsqueda por descripción
- Botones: Create, Edit, Delete
- Modal para crear/editar

#### Component: TransactionModal.jsx

**Fields**:
- Account selector (dropdown)
- Category selector (dropdown)
- Type selector (Income/Expense)
- Amount (number input)
- Currency selector (DOP/USD/EUR)
- Date picker
- Description (text input)
- Notes (textarea, optional)
- Tags multi-select (optional)

**Validations**:
- Amount > 0
- Required fields: account, category, amount, currency, date, description
- Description max 200 caracteres

#### Service: transactionService.js

```javascript
const transactionService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/transactions?${params}`);
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(transaction) {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  async update(id, transaction) {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  async getSummary(startDate, endDate) {
    const response = await api.get('/transactions/summary', {
      params: { startDate, endDate }
    });
    return response.data;
  }
};
```

---

## Flujo de Uso

1. Usuario hace clic en "New Transaction"
2. Modal se abre con formulario vacío
3. Usuario selecciona cuenta y categoría
4. Usuario ingresa monto, fecha, descripción
5. Usuario guarda
6. Backend valida datos
7. Backend crea transacción en DB
8. Backend actualiza balance de cuenta
9. Frontend actualiza listado
10. Notificación de éxito

---

## Reglas de Negocio

1. **Balance Update**: Al crear/editar/eliminar transacción, el balance de la cuenta debe actualizarse
2. **Soft Delete**: Las transacciones eliminadas se marcan como `IsActive = false` (no se borran de DB)
3. **Currency Consistency**: Una transacción debe usar la misma moneda de su cuenta asociada (o convertirse)
4. **Date Validation**: Fecha no puede ser futura (excepto transacciones programadas)
5. **Amount Sign**: Amount siempre es positivo, el tipo (Income/Expense) determina si suma o resta

---

## Casos Edge

1. **Transacción en moneda diferente a la cuenta**: Sistema debe convertir usando exchange rate
2. **Eliminación de transacción antigua**: Si fue usada en reportes, mantener para históricos
3. **Edición de transacción**: Recalcular balance de cuenta
4. **Categoría eliminada**: Transacciones mantienen referencia a categoría inactiva

---

## Testing

### Unit Tests (Backend)

```csharp
[Fact]
public async Task CreateTransaction_ValidData_ReturnsCreated()
{
    // Arrange
    var request = new TransactionRequest { ... };

    // Act
    var result = await _controller.Create(request);

    // Assert
    Assert.IsType<CreatedAtActionResult>(result);
}

[Fact]
public async Task CreateTransaction_NegativeAmount_ReturnsBadRequest()
{
    // Arrange
    var request = new TransactionRequest { Amount = -100 };

    // Act & Assert
    await Assert.ThrowsAsync<ValidationException>(() =>
        _controller.Create(request));
}
```

### Integration Tests (Frontend)

```javascript
describe('Transaction Creation', () => {
  it('should create transaction successfully', async () => {
    const transaction = {
      accountId: 'uuid',
      categoryId: 'uuid',
      type: 'Expense',
      amount: 1500,
      currency: 'DOP',
      date: '2025-01-15',
      description: 'Test transaction'
    };

    const response = await transactionService.create(transaction);

    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
  });
});
```

---

## Performance Optimizations

1. **Indexing**: Índices en `UserId`, `AccountId`, `Date` para queries rápidas
2. **Pagination**: Limitar a 20 resultados por página
3. **Eager Loading**: Cargar Account y Category con Include() para evitar N+1
4. **Caching**: Cache de categorías (raramente cambian)

---

## Archivos Creados/Modificados

### Backend (8 archivos)
- `FinanceManager.Core/Entities/Transaction.cs`
- `FinanceManager.Core/Interfaces/Repositories/ITransactionRepository.cs`
- `FinanceManager.Core/Validators/TransactionValidator.cs`
- `FinanceManager.Infrastructure/Repositories/TransactionRepository.cs`
- `FinanceManager.Infrastructure/Data/Configurations/TransactionConfiguration.cs`
- `FinanceManager.API/Controllers/TransactionsController.cs`
- `FinanceManager.API/DTOs/Requests/TransactionRequest.cs`
- `FinanceManager.API/DTOs/Responses/TransactionResponse.cs`

### Frontend (5 archivos)
- `src/pages/Transactions.jsx`
- `src/components/TransactionModal.jsx`
- `src/components/TransactionTable.jsx`
- `src/services/transactionService.js`
- `src/App.jsx` (modificado para routing)

---

## Dependencias

- Feature 02 (Categories) - Debe existir para asignar categoría
- Feature de Financial Accounts - Debe existir para asociar transacción

---

## Notas de Implementación

1. **Date Handling**: Usar UTC en backend, convertir a local en frontend
2. **Currency Display**: Formatear según locale (DOP → RD$1,500.50)
3. **Decimal Precision**: Usar 2 decimales para todas las monedas
4. **Validation Messages**: Mensajes en español para mejor UX

---

## Screenshots/Mockups

```
┌─────────────────────────────────────────────────────────────┐
│  Transactions                                    [+ New]     │
├─────────────────────────────────────────────────────────────┤
│  Filters: [Date Range] [Category ▼] [Type ▼] [Account ▼]   │
├──────┬─────────────┬────────────┬──────────┬───────────────┤
│ Date │ Description │  Category  │  Amount  │    Actions    │
├──────┼─────────────┼────────────┼──────────┼───────────────┤
│ Jan15│ Supermercado│ Alimentación│-RD$1,500│ [Edit] [Del] │
│ Jan14│ Salary      │ Income     │+RD$50,000│ [Edit] [Del] │
│ Jan13│ Uber        │ Transport  │ -RD$350 │ [Edit] [Del] │
└──────┴─────────────┴────────────┴──────────┴───────────────┘
                      [< Prev]  1/5  [Next >]
```

---

**Última Actualización**: 2025-10-10
**Estado**: Feature completada y validada
**Próximo Feature**: Feature 02 - Category System
