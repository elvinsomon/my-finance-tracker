using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface ISavingsGoalRepository : IRepository<SavingsGoal>
{
    Task<IEnumerable<SavingsGoal>> GetByUserIdAsync(Guid userId, SavingsGoalStatus? status = null);
    Task<SavingsGoal?> GetByIdWithContributionsAsync(Guid id, Guid userId);
    Task<IEnumerable<SavingsContribution>> GetContributionsByGoalIdAsync(Guid goalId, Guid userId);
    Task<SavingsContribution?> GetContributionByIdAsync(Guid contributionId, Guid userId);
    Task AddContributionAsync(SavingsContribution contribution);
    Task DeleteContributionAsync(SavingsContribution contribution);
}
