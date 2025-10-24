using FluentValidation;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Validators;

public class CreateTransactionRequest
{
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? Merchant { get; set; }
    public string? Notes { get; set; }
    public List<TransactionItemRequest>? Items { get; set; }
}

public class TransactionItemRequest
{
    public Guid? CategoryId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
}

public class CreateTransactionValidator : AbstractValidator<CreateTransactionRequest>
{
    public CreateTransactionValidator()
    {
        RuleFor(x => x.AccountId)
            .NotEmpty().WithMessage("Account is required");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category is required");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Transaction type is required")
            .Must(t => t == "Income" || t == "Expense" || t == "Transfer")
            .WithMessage("Type must be Income, Expense, or Transfer");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Must(c => c == "DOP" || c == "USD" || c == "EUR")
            .WithMessage("Currency must be DOP, USD, or EUR");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required")
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Date cannot be in the future");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
    }
}

public class UpdateTransactionRequest
{
    public Guid? AccountId { get; set; }
    public Guid? CategoryId { get; set; }
    public decimal? Amount { get; set; }
    public DateTime? Date { get; set; }
    public string? Description { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Merchant { get; set; }
    public string? Notes { get; set; }
    public List<TransactionItemRequest>? Items { get; set; }
}

public class UpdateTransactionValidator : AbstractValidator<UpdateTransactionRequest>
{
    public UpdateTransactionValidator()
    {
        When(x => x.Amount.HasValue, () =>
        {
            RuleFor(x => x.Amount!.Value)
                .GreaterThan(0).WithMessage("Amount must be greater than zero");
        });

        When(x => x.Date.HasValue, () =>
        {
            RuleFor(x => x.Date!.Value)
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Date cannot be in the future");
        });

        When(x => !string.IsNullOrEmpty(x.Description), () =>
        {
            RuleFor(x => x.Description!)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
        });
    }
}
