using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<IEnumerable<Category>> GetByUserIdAsync(Guid? userId, TransactionType? type = null, bool includeInactive = false);
    Task<IEnumerable<Category>> GetSystemCategoriesAsync(TransactionType? type = null);
}
