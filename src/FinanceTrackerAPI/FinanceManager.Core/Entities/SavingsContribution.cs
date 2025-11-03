using System;

namespace FinanceManager.Core.Entities;

public class SavingsContribution
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public Guid TransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }   

    // Navigation properties
    public SavingsGoal Goal { get; set; } = null!;
    public Transaction Transaction { get; set; } = null!;
}
