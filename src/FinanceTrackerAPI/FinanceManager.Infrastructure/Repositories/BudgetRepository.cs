using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class BudgetRepository : GenericRepository<Budget>, IBudgetRepository
{
    public BudgetRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Budget>> GetByUserIdAsync(Guid userId, bool? isActive = null)
    {
        var query = _dbSet
            .Include(b => b.Category)
            .Where(b => b.UserId == userId);

        if (isActive.HasValue)
            query = query.Where(b => b.IsActive == isActive.Value);

        return await query.OrderByDescending(b => b.StartDate).ToListAsync();
    }

    public async Task<IEnumerable<Budget>> GetActiveBudgetsForDateAsync(Guid userId, DateTime date)
    {
        return await _dbSet
            .Include(b => b.Category)
            .Where(b => b.UserId == userId
                     && b.IsActive
                     && b.StartDate <= date
                     && b.EndDate >= date)
            .ToListAsync();
    }
}
