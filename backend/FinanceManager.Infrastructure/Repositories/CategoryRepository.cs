using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Category>> GetByUserIdAsync(Guid? userId, TransactionType? type = null, bool includeInactive = false)
    {
        var query = _dbSet
            .Include(c => c.Subcategories)
            .Where(c => (c.UserId == userId || c.IsSystem) && c.ParentCategoryId == null);

        if (type.HasValue)
            query = query.Where(c => c.Type == type.Value);

        if (!includeInactive)
            query = query.Where(c => c.IsActive);

        return await query.OrderBy(c => c.Name).ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetSystemCategoriesAsync(TransactionType? type = null)
    {
        var query = _dbSet
            .Include(c => c.Subcategories)
            .Where(c => c.IsSystem);

        if (type.HasValue)
            query = query.Where(c => c.Type == type.Value);

        return await query.OrderBy(c => c.Name).ToListAsync();
    }
}
