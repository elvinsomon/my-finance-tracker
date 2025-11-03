using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IExchangeRateRepository : IRepository<ExchangeRate>
{
    Task<ExchangeRate?> GetRateAsync(string fromCurrency, string toCurrency, DateTime date);
    Task<IEnumerable<ExchangeRate>> GetRatesAsync(string? fromCurrency = null, string? toCurrency = null, DateTime? date = null);
}
