using System;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Entities;

public class ImportHistory
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public Guid FinancialAccountId { get; set; }

    // File Details
    public string OriginalFileName { get; set; } = string.Empty;
    public string StoredFileName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }

    // Currency - CRITICAL FIELD
    public string Currency { get; set; } = string.Empty;

    // Import Results
    public DateTime ImportDate { get; set; }
    public int TotalRowsProcessed { get; set; }
    public int TransactionsImported { get; set; }
    public int ErrorsEncountered { get; set; }
    public string? ErrorDetails { get; set; } // JSON array of errors

    // Status
    public ImportStatus Status { get; set; } = ImportStatus.Pending;

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public FinancialAccount FinancialAccount { get; set; } = null!;
    public ICollection<Transaction> ImportedTransactions { get; set; } = new List<Transaction>();
}
