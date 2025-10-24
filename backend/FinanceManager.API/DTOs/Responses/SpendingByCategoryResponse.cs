namespace FinanceManager.API.DTOs.Responses;

public class SpendingByCategoryResponse
{
    public PeriodInfo Period { get; set; } = null!;
    public List<CategorySpending> Categories { get; set; } = new();
    public decimal TotalSpending { get; set; }
}

public class PeriodInfo
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class CategorySpending
{
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal Percentage { get; set; }
    public int TransactionCount { get; set; }
    public string? Color { get; set; }
}
