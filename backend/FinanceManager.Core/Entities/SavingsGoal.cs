using System;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Entities;

public class SavingsGoal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TargetAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public int Priority { get; set; } = 1;
    public SavingsGoalStatus Status { get; set; } = SavingsGoalStatus.Active;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsEmergencyFund { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<SavingsContribution> SavingsContributions { get; set; } = new List<SavingsContribution>();
}
