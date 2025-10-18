namespace FinanceManager.API.DTOs.Responses;

public class SavingsGoalResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TargetAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public int Priority { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsEmergencyFund { get; set; }
    public decimal Progress { get; set; }
    public decimal RemainingAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
