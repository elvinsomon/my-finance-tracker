using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IImportHistoryRepository
{
    Task<ImportHistory?> GetByIdAsync(int id);
    Task<IEnumerable<ImportHistory>> GetAllByUserIdAsync(Guid userId);
    Task<IEnumerable<ImportHistory>> GetByUserIdPaginatedAsync(Guid userId, int page, int pageSize);
    Task<IEnumerable<ImportHistory>> GetByFinancialAccountIdAsync(Guid financialAccountId);
    Task<ImportHistory> AddAsync(ImportHistory importHistory);
    Task UpdateAsync(ImportHistory importHistory);
    Task<int> CountByUserIdAsync(Guid userId);
}
