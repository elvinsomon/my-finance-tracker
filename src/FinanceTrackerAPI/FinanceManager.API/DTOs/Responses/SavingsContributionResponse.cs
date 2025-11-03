namespace FinanceManager.API.DTOs.Responses;

public class SavingsContributionResponse
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public Guid TransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public TransactionBasicInfo? Transaction { get; set; }
}

public class TransactionBasicInfo
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
}
