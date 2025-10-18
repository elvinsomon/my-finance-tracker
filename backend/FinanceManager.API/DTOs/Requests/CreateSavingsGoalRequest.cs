namespace FinanceManager.API.DTOs.Requests;

public class CreateSavingsGoalRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TargetAmount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime TargetDate { get; set; }
    public int Priority { get; set; } = 1;
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsEmergencyFund { get; set; } = false;
}
