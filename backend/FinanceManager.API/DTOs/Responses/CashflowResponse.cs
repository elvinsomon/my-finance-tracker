namespace FinanceManager.API.DTOs.Responses;

public class CashflowResponse
{
    public int Year { get; set; }
    public List<MonthlyCashflow> Months { get; set; } = new();
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalNetCashflow { get; set; }
}

public class MonthlyCashflow
{
    public string Month { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetCashflow { get; set; }
    public decimal CumulativeCashflow { get; set; }
}
