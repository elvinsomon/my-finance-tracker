namespace FinanceManager.API.DTOs.Requests;

public class CreateAccountRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public string? Institution { get; set; }
    public string? AccountNumber { get; set; }
}
