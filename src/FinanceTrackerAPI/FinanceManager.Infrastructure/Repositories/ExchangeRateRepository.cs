using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class ExchangeRateRepository : GenericRepository<ExchangeRate>, IExchangeRateRepository
{
    public ExchangeRateRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<ExchangeRate?> GetRateAsync(string fromCurrency, string toCurrency, DateTime date)
    {
        return await _dbSet
            .Where(r => r.FromCurrency == fromCurrency
                     && r.ToCurrency == toCurrency
                     && r.Date.Date == date.Date)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<ExchangeRate>> GetRatesAsync(string? fromCurrency = null, string? toCurrency = null, DateTime? date = null)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrEmpty(fromCurrency))
            query = query.Where(r => r.FromCurrency == fromCurrency);

        if (!string.IsNullOrEmpty(toCurrency))
            query = query.Where(r => r.ToCurrency == toCurrency);

        if (date.HasValue)
            query = query.Where(r => r.Date.Date == date.Value.Date);

        return await query.OrderByDescending(r => r.Date).ToListAsync();
    }
}
