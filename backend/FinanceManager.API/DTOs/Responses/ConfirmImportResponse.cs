namespace FinanceManager.API.DTOs.Responses;

public class ConfirmImportResponse
{
    public int ImportHistoryId { get; set; }
    public int TransactionsImported { get; set; }
    public int ErrorsSkipped { get; set; }
    public List<Guid> ImportedTransactionIds { get; set; } = new();
}
