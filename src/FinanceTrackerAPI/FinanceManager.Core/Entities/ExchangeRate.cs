using System;

namespace FinanceManager.Core.Entities;

public class ExchangeRate
{
    public Guid Id { get; set; }
    public string FromCurrency { get; set; } = string.Empty;
    public string ToCurrency { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public DateTime Date { get; set; }
    public string Source { get; set; } = "Manual";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
