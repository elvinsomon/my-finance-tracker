# Feature 06 - CSV Export

**Estado**: ✅ Completado
**Prioridad**: Baja
**Complejidad**: Baja
**Tiempo Estimado**: 0.5-1 día
**Tiempo Real**: 0.5 horas

---

## Objetivo

Exportar transacciones a formato CSV para análisis externo, respaldos, o integración con otras herramientas.

---

## User Stories

1. Como usuario, quiero exportar mis transacciones a CSV
2. Como usuario, quiero filtrar qué transacciones exportar (fecha, categoría, cuenta)
3. Como usuario, quiero elegir qué columnas incluir en el export
4. Como usuario, quiero el archivo descargue automáticamente

---

## Especificación Técnica

### Backend

#### Controller: TransactionsController (Extensión)

**Endpoint adicional**:
- `GET /api/transactions/export` - Exportar transacciones a CSV

**Query Parameters**:
- `startDate` (optional): Fecha inicio (ISO 8601)
- `endDate` (optional): Fecha fin
- `categoryId` (optional): Filtrar por categoría
- `accountId` (optional): Filtrar por cuenta
- `type` (optional): Income/Expense
- `columns` (optional): Comma-separated list de columnas

#### Service: CsvExportService

```csharp
public class CsvExportService
{
    public async Task<byte[]> ExportTransactionsToCsvAsync(
        Guid userId,
        TransactionExportFilter filter)
    {
        var transactions = await _transactionRepository
            .GetByFilterAsync(userId, filter);

        var csv = new StringBuilder();

        // Headers
        csv.AppendLine(string.Join(",", filter.Columns ?? GetDefaultColumns()));

        // Data rows
        foreach (var transaction in transactions)
        {
            var row = BuildCsvRow(transaction, filter.Columns);
            csv.AppendLine(row);
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private string[] GetDefaultColumns()
    {
        return new[]
        {
            "Date",
            "Description",
            "Category",
            "Account",
            "Type",
            "Amount",
            "Currency",
            "Notes"
        };
    }

    private string BuildCsvRow(Transaction transaction, string[] columns)
    {
        var values = new List<string>();

        foreach (var column in columns ?? GetDefaultColumns())
        {
            var value = column switch
            {
                "Date" => transaction.Date.ToString("yyyy-MM-dd"),
                "Description" => EscapeCsvValue(transaction.Description),
                "Category" => EscapeCsvValue(transaction.Category.Name),
                "Account" => EscapeCsvValue(transaction.Account.Name),
                "Type" => transaction.Type.ToString(),
                "Amount" => (transaction.Type == TransactionType.Expense ? "-" : "") + transaction.Amount.ToString("F2"),
                "Currency" => transaction.Currency,
                "Notes" => EscapeCsvValue(transaction.Notes ?? ""),
                _ => ""
            };

            values.Add(value);
        }

        return string.Join(",", values);
    }

    private string EscapeCsvValue(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "";

        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}
```

#### Controller Implementation

```csharp
[HttpGet("export")]
public async Task<IActionResult> ExportToCsv(
    [FromQuery] DateTime? startDate,
    [FromQuery] DateTime? endDate,
    [FromQuery] Guid? categoryId,
    [FromQuery] Guid? accountId,
    [FromQuery] TransactionType? type,
    [FromQuery] string? columns)
{
    var userId = GetCurrentUserId();

    var filter = new TransactionExportFilter
    {
        StartDate = startDate,
        EndDate = endDate,
        CategoryId = categoryId,
        AccountId = accountId,
        Type = type,
        Columns = columns?.Split(',')
    };

    var csvBytes = await _csvExportService.ExportTransactionsToCsvAsync(userId, filter);

    var fileName = $"transactions_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

    return File(csvBytes, "text/csv", fileName);
}
```

### Frontend

#### Component: ExportModal.jsx

```jsx
function ExportModal({ isOpen, onClose }) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    accountId: '',
    type: ''
  });

  const [selectedColumns, setSelectedColumns] = useState([
    'Date',
    'Description',
    'Category',
    'Account',
    'Type',
    'Amount',
    'Currency'
  ]);

  const availableColumns = [
    'Date',
    'Description',
    'Category',
    'Account',
    'Type',
    'Amount',
    'Currency',
    'Notes',
    'Tags',
    'CreatedAt'
  ];

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.accountId) params.append('accountId', filters.accountId);
      if (filters.type) params.append('type', filters.type);
      if (selectedColumns.length > 0) params.append('columns', selectedColumns.join(','));

      // Trigger download
      const url = `/api/transactions/export?${params.toString()}`;
      window.location.href = url;

      // Alternative: use fetch + blob
      // const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      // const blob = await response.blob();
      // const downloadUrl = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = downloadUrl;
      // link.download = `transactions_${Date.now()}.csv`;
      // document.body.appendChild(link);
      // link.click();
      // link.remove();

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export transactions');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Transactions">
      <div className="space-y-6">
        {/* Filters Section */}
        <div>
          <h3 className="font-medium mb-3">Filters</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
            <CategorySelector
              label="Category (optional)"
              value={filters.categoryId}
              onChange={(value) => setFilters({ ...filters, categoryId: value })}
              allowEmpty
            />
            <AccountSelector
              label="Account (optional)"
              value={filters.accountId}
              onChange={(value) => setFilters({ ...filters, accountId: value })}
              allowEmpty
            />
            <Select
              label="Type (optional)"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              options={[
                { value: '', label: 'All' },
                { value: 'Income', label: 'Income' },
                { value: 'Expense', label: 'Expense' }
              ]}
            />
          </div>
        </div>

        {/* Columns Section */}
        <div>
          <h3 className="font-medium mb-3">Columns to Export</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableColumns.map((column) => (
              <Checkbox
                key={column}
                label={column}
                checked={selectedColumns.includes(column)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColumns([...selectedColumns, column]);
                  } else {
                    setSelectedColumns(selectedColumns.filter(c => c !== column));
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn-primary"
            disabled={selectedColumns.length === 0}
          >
            Export to CSV
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## Formato CSV

### Ejemplo de Output

```csv
Date,Description,Category,Account,Type,Amount,Currency,Notes
2025-01-15,Supermercado Nacional,Alimentación,Tarjeta Visa,Expense,-1500.00,DOP,Compra semanal
2025-01-14,Salary,Salario,Cuenta Corriente,Income,50000.00,DOP,
2025-01-13,Uber,Transporte,Tarjeta Visa,Expense,-350.00,DOP,
2025-01-12,"Restaurant ""El Mesón""",Entretenimiento,Tarjeta Visa,Expense,-2500.00,DOP,Cena familiar
```

**Características**:
- UTF-8 encoding
- Commas as delimiter
- Quoted strings if contain commas or quotes
- ISO 8601 dates (yyyy-MM-dd)
- Amount con signo negativo para expenses
- Empty values como string vacío

---

## Reglas de Negocio

1. **Security**: Solo exportar transacciones del usuario autenticado
2. **Size Limit**: Máximo 10,000 transacciones por export (paginar si más)
3. **Date Range**: Por defecto, últimos 12 meses
4. **Encoding**: UTF-8 para soportar caracteres especiales
5. **Filename**: `transactions_YYYYMMDD_HHMMSS.csv`

---

## Testing

```csharp
[Fact]
public async Task ExportToCsv_GeneratesValidCsv()
{
    // Arrange
    var userId = Guid.NewGuid();
    // Seed 5 transactions

    // Act
    var csv = await _csvExportService.ExportTransactionsToCsvAsync(userId, new());
    var csvString = Encoding.UTF8.GetString(csv);

    // Assert
    Assert.StartsWith("Date,Description", csvString);
    Assert.Equal(6, csvString.Split('\n').Length); // 1 header + 5 data rows
}

[Fact]
public async Task ExportToCsv_EscapesSpecialCharacters()
{
    // Arrange - Transaction with description: Test "quoted" value, comma

    // Act
    var csv = await _csvExportService.ExportTransactionsToCsvAsync(userId, new());
    var csvString = Encoding.UTF8.GetString(csv);

    // Assert
    Assert.Contains("\"Test \"\"quoted\"\" value, comma\"", csvString);
}
```

---

## Extensiones Futuras

1. **Excel Export**: Agregar formato .xlsx
2. **PDF Export**: Reporte formateado en PDF
3. **Email Export**: Enviar export por email
4. **Scheduled Exports**: Exports automáticos mensuales
5. **Template Support**: Guardar configuraciones de export

---

## Archivos Creados/Modificados

### Backend (2 archivos)
- `FinanceManager.API/Services/CsvExportService.cs`
- `FinanceManager.API/Controllers/TransactionsController.cs` (nuevo endpoint)

### Frontend (1 archivo)
- `src/components/ExportModal.jsx`

---

## UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  Export Transactions to CSV                          [X]    │
├─────────────────────────────────────────────────────────────┤
│  Filters                                                    │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │ Start Date: [____]  │ │ End Date: [____]    │          │
│  └─────────────────────┘ └─────────────────────┘          │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │ Category: [All  ▼]  │ │ Account: [All  ▼]   │          │
│  └─────────────────────┘ └─────────────────────┘          │
│  ┌─────────────────────┐                                   │
│  │ Type: [All  ▼]      │                                   │
│  └─────────────────────┘                                   │
├─────────────────────────────────────────────────────────────┤
│  Columns to Export                                          │
│  ☑ Date           ☑ Description    ☑ Category              │
│  ☑ Account        ☑ Type           ☑ Amount                │
│  ☑ Currency       ☐ Notes          ☐ Tags                  │
│  ☐ Created At                                               │
├─────────────────────────────────────────────────────────────┤
│                                    [Cancel] [Export to CSV] │
└─────────────────────────────────────────────────────────────┘
```

---

**Última Actualización**: 2025-10-10
**Estado**: Feature completada
**Dependencias**: Feature 01 (Transactions)
