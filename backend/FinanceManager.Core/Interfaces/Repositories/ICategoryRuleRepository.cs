using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface ICategoryRuleRepository : IRepository<CategoryRule>
{
    /// <summary>
    /// Gets all active rules for a user, ordered by priority (descending)
    /// </summary>
    Task<List<CategoryRule>> GetActiveRulesByUserIdAsync(Guid userId);

    /// <summary>
    /// Gets a specific rule by ID, ensuring it belongs to the user
    /// </summary>
    Task<CategoryRule?> GetByIdAndUserIdAsync(int id, Guid userId);

    /// <summary>
    /// Increments the match count for a rule and updates last matched date
    /// </summary>
    Task IncrementMatchCountAsync(int ruleId);
}
