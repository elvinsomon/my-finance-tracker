using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class TransactionRepository : GenericRepository<Transaction>, ITransactionRepository
{
    public TransactionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<(IEnumerable<Transaction> Items, int TotalCount)> GetPagedAsync(
        Guid userId,
        int page,
        int pageSize,
        DateTime? startDate = null,
        DateTime? endDate = null,
        TransactionType? type = null,
        Guid? categoryId = null,
        Guid? accountId = null)
    {
        var query = _dbSet
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.UserId == userId);

        if (startDate.HasValue)
            query = query.Where(t => t.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.Date <= endDate.Value);

        if (type.HasValue)
            query = query.Where(t => t.Type == type.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetByCategoryAndDateRangeAsync(Guid categoryId, DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Where(t => t.CategoryId == categoryId && t.Date >= startDate && t.Date <= endDate)
            .ToListAsync();
    }

    public override async Task<Transaction?> GetByIdAsync(Guid id)
    {
        return await _dbSet
            .Include(t => t.Account)
            .Include(t => t.Category)
            .FirstOrDefaultAsync(t => t.Id == id);
    }
}
