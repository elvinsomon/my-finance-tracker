namespace FinanceManager.API.DTOs.Responses;

public class ComparisonResponse
{
    public PeriodSummary Current { get; set; } = null!;
    public PeriodSummary Previous { get; set; } = null!;
    public ChangeMetrics Changes { get; set; } = null!;
}

public class PeriodSummary
{
    public string Period { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal Savings { get; set; }
}

public class ChangeMetrics
{
    public decimal IncomeChange { get; set; }
    public decimal IncomeChangePercentage { get; set; }
    public decimal ExpensesChange { get; set; }
    public decimal ExpensesChangePercentage { get; set; }
    public decimal SavingsChange { get; set; }
    public decimal SavingsChangePercentage { get; set; }
}
