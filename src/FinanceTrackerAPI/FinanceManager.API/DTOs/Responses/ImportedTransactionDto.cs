using FinanceManager.Core.Enums;

namespace FinanceManager.API.DTOs.Responses;

public class ImportedTransactionDto
{
    public int RowNumber { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string ExternalReference { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public List<string> ValidationErrors { get; set; } = new();

    // Auto-Categorization (Phase 3)
    public Guid? SuggestedCategoryId { get; set; }
    public string? SuggestedCategoryName { get; set; }
    public decimal ConfidenceScore { get; set; }
    public string? MatchedRuleName { get; set; }

    // Duplicate Detection (Phase 2)
    public DuplicateStatus DuplicateStatus { get; set; } = DuplicateStatus.New;
    public Guid? ExistingTransactionId { get; set; }
    public string? DuplicateReason { get; set; }
}
