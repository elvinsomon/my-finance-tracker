namespace FinanceManager.API.DTOs.Responses;

public class UploadCsvResponse
{
    public Guid UploadId { get; set; }
    public string DetectedBank { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public FileInfoDto FileInfo { get; set; } = null!;
    public string Currency { get; set; } = string.Empty;
    public bool CurrencyDetected { get; set; }
    public List<ImportedTransactionDto> Preview { get; set; } = new();
}

public class FileInfoDto
{
    public string FileName { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public int RowCount { get; set; }
    public string Encoding { get; set; } = string.Empty;
}
