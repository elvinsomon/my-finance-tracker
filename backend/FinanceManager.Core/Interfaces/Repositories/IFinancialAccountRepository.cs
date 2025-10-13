using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IFinancialAccountRepository : IRepository<FinancialAccount>
{
    Task<IEnumerable<FinancialAccount>> GetByUserIdAsync(Guid userId);
    Task UpdateBalanceAsync(Guid accountId, decimal newBalance);
}
