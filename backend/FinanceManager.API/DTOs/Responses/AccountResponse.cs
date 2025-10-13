namespace FinanceManager.API.DTOs.Responses;

public class AccountResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string? Institution { get; set; }
    public string? AccountNumber { get; set; }
    public bool IsActive { get; set; }
}
