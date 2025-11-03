using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class FinancialAccountRepository : GenericRepository<FinancialAccount>, IFinancialAccountRepository
{
    public FinancialAccountRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<FinancialAccount>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Where(a => a.UserId == userId)
            .OrderBy(a => a.Name)
            .ToListAsync();
    }

    public async Task UpdateBalanceAsync(Guid accountId, decimal newBalance)
    {
        var account = await _dbSet.FindAsync(accountId);
        if (account != null)
        {
            account.CurrentBalance = newBalance;
            _dbSet.Update(account);
        }
    }
}
