using System;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal ExchangeRate { get; set; } = 1;
    public decimal AmountInBaseCurrency { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? Merchant { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Completed;
    public string? Notes { get; set; }
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public FinancialAccount Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<TransactionItem> Items { get; set; } = new List<TransactionItem>();
    public ICollection<SavingsContribution> SavingsContributions { get; set; } = new List<SavingsContribution>();
}
