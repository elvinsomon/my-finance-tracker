namespace FinanceManager.API.DTOs.Responses;

public class ImportHistoryResponse
{
    public int Id { get; set; }
    public DateTime ImportDate { get; set; }
    public string OriginalFileName { get; set; } = string.Empty;
    public string FinancialAccountName { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public int TransactionsImported { get; set; }
    public int ErrorsEncountered { get; set; }
    public string Status { get; set; } = string.Empty;
}
