namespace FinanceManager.API.DTOs.Requests;

public class CreateBudgetRequest
{
    public Guid CategoryId { get; set; }
    public string Period { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AlertThreshold80 { get; set; } = true;
    public bool AlertThreshold100 { get; set; } = true;
}
