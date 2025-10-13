using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<(IEnumerable<Transaction> Items, int TotalCount)> GetPagedAsync(
        Guid userId,
        int page,
        int pageSize,
        DateTime? startDate = null,
        DateTime? endDate = null,
        TransactionType? type = null,
        Guid? categoryId = null,
        Guid? accountId = null);

    Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Transaction>> GetByCategoryAndDateRangeAsync(Guid categoryId, DateTime startDate, DateTime endDate);
}
