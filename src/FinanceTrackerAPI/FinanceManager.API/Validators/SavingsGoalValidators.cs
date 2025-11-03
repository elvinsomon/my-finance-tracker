using FluentValidation;
using FinanceManager.API.DTOs.Requests;

namespace FinanceManager.API.Validators;

public class CreateSavingsGoalValidator : AbstractValidator<CreateSavingsGoalRequest>
{
    public CreateSavingsGoalValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.TargetAmount)
            .GreaterThan(0).WithMessage("Target amount must be greater than zero");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Must(c => c == "DOP" || c == "USD" || c == "EUR")
            .WithMessage("Currency must be DOP, USD, or EUR");

        RuleFor(x => x.TargetDate)
            .NotEmpty().WithMessage("Target date is required")
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Target date cannot be in the past");

        RuleFor(x => x.Priority)
            .InclusiveBetween(1, 10).WithMessage("Priority must be between 1 and 10");
    }
}

public class UpdateSavingsGoalValidator : AbstractValidator<UpdateSavingsGoalRequest>
{
    public UpdateSavingsGoalValidator()
    {
        When(x => !string.IsNullOrEmpty(x.Name), () =>
        {
            RuleFor(x => x.Name!)
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters");
        });

        When(x => !string.IsNullOrEmpty(x.Description), () =>
        {
            RuleFor(x => x.Description!)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");
        });

        When(x => x.TargetAmount.HasValue, () =>
        {
            RuleFor(x => x.TargetAmount!.Value)
                .GreaterThan(0).WithMessage("Target amount must be greater than zero");
        });

        When(x => x.TargetDate.HasValue, () =>
        {
            RuleFor(x => x.TargetDate!.Value)
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Target date cannot be in the past");
        });

        When(x => x.Priority.HasValue, () =>
        {
            RuleFor(x => x.Priority!.Value)
                .InclusiveBetween(1, 10).WithMessage("Priority must be between 1 and 10");
        });

        When(x => !string.IsNullOrEmpty(x.Status), () =>
        {
            RuleFor(x => x.Status!)
                .Must(s => s == "Active" || s == "Completed" || s == "Cancelled")
                .WithMessage("Status must be Active, Completed, or Cancelled");
        });
    }
}

public class AddContributionValidator : AbstractValidator<AddContributionRequest>
{
    public AddContributionValidator()
    {
        RuleFor(x => x.TransactionId)
            .NotEmpty().WithMessage("Transaction is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required")
            .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Date cannot be in the future");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
    }
}
