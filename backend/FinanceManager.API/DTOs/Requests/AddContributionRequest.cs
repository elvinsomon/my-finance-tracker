namespace FinanceManager.API.DTOs.Requests;

public class AddContributionRequest
{
    public Guid TransactionId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public string? Notes { get; set; }
}
