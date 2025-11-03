using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IBudgetRepository : IRepository<Budget>
{
    Task<IEnumerable<Budget>> GetByUserIdAsync(Guid userId, bool? isActive = null);
    Task<IEnumerable<Budget>> GetActiveBudgetsForDateAsync(Guid userId, DateTime date);
}
