namespace FinanceManager.API.DTOs.Responses;

public class TrendsResponse
{
    public List<MonthlyTrend> Months { get; set; } = new();
    public decimal AverageMonthlyIncome { get; set; }
    public decimal AverageMonthlyExpenses { get; set; }
    public decimal AverageMonthlySavings { get; set; }
}

public class MonthlyTrend
{
    public string Month { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal Savings { get; set; }
    public decimal NetCashflow { get; set; }
}
