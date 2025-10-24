using System;

namespace FinanceManager.Core.Entities;

public class TransactionItem
{
    public Guid Id { get; set; }
    public Guid TransactionId { get; set; }
    public Guid CategoryId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Transaction Transaction { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
