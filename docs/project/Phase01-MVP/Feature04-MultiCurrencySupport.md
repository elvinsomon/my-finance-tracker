# Feature 04 - Multi-Currency Support

**Estado**: ✅ Completado
**Prioridad**: Media
**Complejidad**: Media
**Tiempo Estimado**: 1-2 días
**Tiempo Real**: 1 hora

---

## Objetivo

Soporte para múltiples monedas (DOP, USD, EUR) con conversión automática y almacenamiento de tasas de cambio.

---

## User Stories

1. Como usuario, quiero crear cuentas en diferentes monedas
2. Como usuario, quiero registrar transacciones en diferentes monedas
3. Como usuario, quiero ver mi balance total en una moneda base
4. Como usuario, quiero que el sistema convierta automáticamente entre monedas
5. Como administrador, quiero actualizar tasas de cambio

---

## Monedas Soportadas

| Código | Nombre | Símbolo | Decimales |
|--------|--------|---------|-----------|
| DOP | Peso Dominicano | RD$ | 2 |
| USD | Dólar Estadounidense | $ | 2 |
| EUR | Euro | € | 2 |

---

## Especificación Técnica

### Backend

#### Entity: ExchangeRate

```csharp
public class ExchangeRate
{
    public int Id { get; set; }
    public string FromCurrency { get; set; } // DOP, USD, EUR
    public string ToCurrency { get; set; }
    public decimal Rate { get; set; }
    public DateTime EffectiveDate { get; set; }
    public string Source { get; set; } // "Manual", "API", "BancoCentral"
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### Extensión: Transaction

```csharp
public class Transaction
{
    // Existing fields...
    public string Currency { get; set; } // DOP, USD, EUR

    // For multi-currency support
    public decimal? ExchangeRate { get; set; } // Rate used at transaction time
    public decimal? BaseAmount { get; set; } // Amount in user's base currency
    public string BaseCurrency { get; set; } // User's base currency
}
```

#### Service: CurrencyConverterService

```csharp
public class CurrencyConverterService
{
    private readonly IExchangeRateRepository _exchangeRateRepository;

    public async Task<decimal> ConvertAsync(
        decimal amount,
        string fromCurrency,
        string toCurrency,
        DateTime? date = null)
    {
        if (fromCurrency == toCurrency)
            return amount;

        var effectiveDate = date ?? DateTime.UtcNow;

        var rate = await _exchangeRateRepository
            .GetLatestRateAsync(fromCurrency, toCurrency, effectiveDate);

        if (rate == null)
            throw new CurrencyConversionException(
                $"No exchange rate found for {fromCurrency} to {toCurrency}");

        return amount * rate.Rate;
    }

    public async Task<Dictionary<string, decimal>> ConvertToAllAsync(
        decimal amount,
        string fromCurrency)
    {
        var currencies = new[] { "DOP", "USD", "EUR" };
        var result = new Dictionary<string, decimal>();

        foreach (var toCurrency in currencies)
        {
            var converted = await ConvertAsync(amount, fromCurrency, toCurrency);
            result[toCurrency] = converted;
        }

        return result;
    }
}
```

#### Controller: ExchangeRatesController

**Endpoints**:
- `GET /api/exchange-rates/latest` - Obtener tasas actuales
- `GET /api/exchange-rates/convert?amount=100&from=USD&to=DOP` - Convertir monto
- `POST /api/exchange-rates` - Crear/actualizar tasa (admin)
- `GET /api/exchange-rates/history?from=USD&to=DOP&days=30` - Histórico

#### DTOs

**ExchangeRateResponse**:
```json
{
  "fromCurrency": "USD",
  "toCurrency": "DOP",
  "rate": 58.50,
  "effectiveDate": "2025-01-15T00:00:00Z",
  "source": "Manual"
}
```

**ConvertCurrencyRequest**:
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "DOP"
}
```

**ConvertCurrencyResponse**:
```json
{
  "amount": 100,
  "fromCurrency": "USD",
  "toCurrency": "DOP",
  "rate": 58.50,
  "convertedAmount": 5850.00,
  "date": "2025-01-15T10:30:00Z"
}
```

#### Seeder: ExchangeRateSeeder

```csharp
public class ExchangeRateSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.ExchangeRates.AnyAsync()) return;

        var today = DateTime.UtcNow;

        var rates = new List<ExchangeRate>
        {
            // USD <-> DOP
            new() { FromCurrency = "USD", ToCurrency = "DOP", Rate = 58.50m, EffectiveDate = today, Source = "Manual", IsActive = true },
            new() { FromCurrency = "DOP", ToCurrency = "USD", Rate = 0.0171m, EffectiveDate = today, Source = "Manual", IsActive = true },

            // EUR <-> DOP
            new() { FromCurrency = "EUR", ToCurrency = "DOP", Rate = 63.20m, EffectiveDate = today, Source = "Manual", IsActive = true },
            new() { FromCurrency = "DOP", ToCurrency = "EUR", Rate = 0.0158m, EffectiveDate = today, Source = "Manual", IsActive = true },

            // USD <-> EUR
            new() { FromCurrency = "USD", ToCurrency = "EUR", Rate = 0.92m, EffectiveDate = today, Source = "Manual", IsActive = true },
            new() { FromCurrency = "EUR", ToCurrency = "USD", Rate = 1.09m, EffectiveDate = today, Source = "Manual", IsActive = true }
        };

        await context.ExchangeRates.AddRangeAsync(rates);
        await context.SaveChangesAsync();
    }
}
```

### Frontend

#### Component: CurrencySelector.jsx

```jsx
function CurrencySelector({ value, onChange, label }) {
  const currencies = [
    { code: 'DOP', name: 'Peso Dominicano', symbol: 'RD$' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' }
  ];

  return (
    <div>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
      >
        {currencies.map(c => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

#### Utility: currencyFormatter.js

```javascript
export function formatCurrency(amount, currency = 'DOP') {
  const formatters = {
    DOP: new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }),
    USD: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }),
    EUR: new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    })
  };

  return formatters[currency]?.format(amount) || `${currency} ${amount.toFixed(2)}`;
}

export function getCurrencySymbol(currency) {
  const symbols = {
    DOP: 'RD$',
    USD: '$',
    EUR: '€'
  };
  return symbols[currency] || currency;
}
```

#### Component: CurrencyConverter.jsx

```jsx
function CurrencyConverter() {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('DOP');
  const [result, setResult] = useState(null);

  const handleConvert = async () => {
    try {
      const response = await api.get('/exchange-rates/convert', {
        params: { amount, from: fromCurrency, to: toCurrency }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };

  return (
    <div className="currency-converter">
      <h3>Currency Converter</h3>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <CurrencySelector value={fromCurrency} onChange={setFromCurrency} />
      <span>→</span>
      <CurrencySelector value={toCurrency} onChange={setToCurrency} />
      <button onClick={handleConvert}>Convert</button>

      {result && (
        <div className="result">
          {formatCurrency(result.amount, fromCurrency)} =
          {formatCurrency(result.convertedAmount, toCurrency)}
          <small>Rate: {result.rate}</small>
        </div>
      )}
    </div>
  );
}
```

---

## Reglas de Negocio

1. **Base Currency**: Cada usuario tiene una moneda base (default: DOP)
2. **Transaction Storage**: Transacciones almacenan moneda original + monto convertido
3. **Exchange Rate Lock**: Al crear transacción, se guarda tasa de cambio usada
4. **Dashboard Display**: Balance total muestra en moneda base del usuario
5. **Historical Accuracy**: Usar tasa de cambio de la fecha de la transacción

---

## Estrategia de Conversión

### Opción 1: Conversión Directa (Implementada)
```
USD → DOP: multiply by rate (58.50)
DOP → USD: divide by rate (1/58.50 = 0.0171)
```

### Opción 2: Triangular via Base Currency
```
EUR → DOP: EUR → USD → DOP
Rate = EUR_to_USD * USD_to_DOP
```

**Decisión**: Usar Opción 1 con tasas directas para cada par de monedas.

---

## Performance Optimizations

1. **Caching**: Cache de tasas por 1 hora (raramente cambian intraday)
2. **Batch Conversion**: Convertir múltiples transacciones en una query
3. **Materialized View**: Pre-calcular balances en moneda base

---

## Testing

```csharp
[Fact]
public async Task ConvertCurrency_USD_To_DOP_ReturnsCorrectAmount()
{
    // Arrange
    var service = new CurrencyConverterService(_rateRepo);

    // Act
    var result = await service.ConvertAsync(100, "USD", "DOP");

    // Assert
    Assert.Equal(5850, result); // 100 * 58.50
}

[Fact]
public async Task ConvertCurrency_SameCurrency_ReturnsOriginalAmount()
{
    // Act
    var result = await service.ConvertAsync(100, "USD", "USD");

    // Assert
    Assert.Equal(100, result);
}

[Fact]
public async Task ConvertCurrency_NoRate_ThrowsException()
{
    // Arrange - No rate in DB

    // Act & Assert
    await Assert.ThrowsAsync<CurrencyConversionException>(() =>
        service.ConvertAsync(100, "USD", "JPY"));
}
```

---

## Archivos Creados/Modificados

### Backend (5 archivos)
- `FinanceManager.Core/Entities/ExchangeRate.cs`
- `FinanceManager.Core/Services/CurrencyConverterService.cs`
- `FinanceManager.Infrastructure/Repositories/ExchangeRateRepository.cs`
- `FinanceManager.API/Controllers/ExchangeRatesController.cs`
- `FinanceManager.Infrastructure/Seeders/ExchangeRateSeeder.cs`

### Frontend (3 archivos)
- `src/components/CurrencySelector.jsx`
- `src/components/CurrencyConverter.jsx`
- `src/utils/currencyFormatter.js`

---

## Extensiones Futuras

1. **Auto-Update Rates**: Integración con API de Banco Central RD
2. **More Currencies**: Agregar más monedas según necesidad
3. **Rate Alerts**: Notificar cuando tasa alcanza cierto valor
4. **Historical Charts**: Gráfico de evolución de tasas

---

**Última Actualización**: 2025-10-10
**Estado**: Feature completada
**Dependencias**: Ninguna
