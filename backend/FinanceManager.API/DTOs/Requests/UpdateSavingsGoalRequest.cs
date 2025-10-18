namespace FinanceManager.API.DTOs.Requests;

public class UpdateSavingsGoalRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? TargetAmount { get; set; }
    public DateTime? TargetDate { get; set; }
    public int? Priority { get; set; }
    public string? Status { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool? IsEmergencyFund { get; set; }
}
