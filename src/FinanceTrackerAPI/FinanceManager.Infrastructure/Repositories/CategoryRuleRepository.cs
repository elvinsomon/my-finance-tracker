using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class CategoryRuleRepository : GenericRepository<CategoryRule>, ICategoryRuleRepository
{
    public CategoryRuleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<List<CategoryRule>> GetActiveRulesByUserIdAsync(Guid userId)
    {
        return await _dbSet
            .Include(cr => cr.Category)
            .Where(cr => cr.UserId == userId && cr.IsActive)
            .OrderByDescending(cr => cr.Priority)
            .ThenBy(cr => cr.RuleName)
            .ToListAsync();
    }

    public async Task<CategoryRule?> GetByIdAndUserIdAsync(int id, Guid userId)
    {
        return await _dbSet
            .Include(cr => cr.Category)
            .FirstOrDefaultAsync(cr => cr.Id == id && cr.UserId == userId);
    }

    public async Task IncrementMatchCountAsync(int ruleId)
    {
        var rule = await _dbSet.FindAsync(ruleId);
        if (rule != null)
        {
            rule.MatchCount++;
            rule.LastMatchedDate = DateTime.UtcNow;
            _dbSet.Update(rule);
        }
    }
}
