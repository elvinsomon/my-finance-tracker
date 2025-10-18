using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Infrastructure.Data;

namespace FinanceManager.Infrastructure.Repositories;

public class SavingsGoalRepository : GenericRepository<SavingsGoal>, ISavingsGoalRepository
{
    public SavingsGoalRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<SavingsGoal>> GetByUserIdAsync(Guid userId, SavingsGoalStatus? status = null)
    {
        var query = _dbSet
            .Include(sg => sg.SavingsContributions)
            .Where(sg => sg.UserId == userId);

        if (status.HasValue)
            query = query.Where(sg => sg.Status == status.Value);

        return await query.OrderBy(sg => sg.Priority).ThenByDescending(sg => sg.CreatedAt).ToListAsync();
    }

    public async Task<SavingsGoal?> GetByIdWithContributionsAsync(Guid id, Guid userId)
    {
        return await _dbSet
            .Include(sg => sg.SavingsContributions)
                .ThenInclude(sc => sc.Transaction)
            .FirstOrDefaultAsync(sg => sg.Id == id && sg.UserId == userId);
    }

    public async Task<IEnumerable<SavingsContribution>> GetContributionsByGoalIdAsync(Guid goalId, Guid userId)
    {
        var goal = await _dbSet
            .Include(sg => sg.SavingsContributions)
                .ThenInclude(sc => sc.Transaction)
            .FirstOrDefaultAsync(sg => sg.Id == goalId && sg.UserId == userId);

        return goal?.SavingsContributions ?? new List<SavingsContribution>();
    }

    public async Task<SavingsContribution?> GetContributionByIdAsync(Guid contributionId, Guid userId)
    {
        return await _context.Set<SavingsContribution>()
            .Include(sc => sc.Goal)
            .Include(sc => sc.Transaction)
            .FirstOrDefaultAsync(sc => sc.Id == contributionId && sc.Goal.UserId == userId);
    }

    public async Task AddContributionAsync(SavingsContribution contribution)
    {
        await _context.Set<SavingsContribution>().AddAsync(contribution);
    }

    public async Task DeleteContributionAsync(SavingsContribution contribution)
    {
        _context.Set<SavingsContribution>().Remove(contribution);
        await Task.CompletedTask;
    }
}
