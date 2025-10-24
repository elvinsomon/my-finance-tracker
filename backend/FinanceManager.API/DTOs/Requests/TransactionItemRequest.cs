namespace FinanceManager.API.DTOs.Requests;

public class TransactionItemRequest
{
    public Guid? CategoryId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
}
