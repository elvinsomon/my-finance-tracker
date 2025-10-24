namespace FinanceManager.API.DTOs.Responses;

public class TopExpensesResponse
{
    public PeriodInfo Period { get; set; } = null!;
    public List<ExpenseDetail> TopExpenses { get; set; } = new();
    public decimal TotalAmount { get; set; }
}

public class ExpenseDetail
{
    public Guid TransactionId { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
}
