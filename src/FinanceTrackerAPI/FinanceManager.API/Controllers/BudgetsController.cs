using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Exceptions;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.API.DTOs.Requests;
using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public BudgetsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedException("User not authenticated");
        return Guid.Parse(userIdClaim.Value);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetResponse>>> GetBudgets([FromQuery] bool? isActive = null)
    {
        var userId = GetUserId();
        var budgets = await _unitOfWork.Budgets.GetByUserIdAsync(userId, isActive);

        var response = new List<BudgetResponse>();

        foreach (var budget in budgets)
        {
            var transactions = await _unitOfWork.Transactions.GetByCategoryAndDateRangeAsync(
                budget.CategoryId, budget.StartDate, budget.EndDate);

            var spent = transactions
                .Where(t => t.Type == TransactionType.Expense)
                .Sum(t => t.AmountInBaseCurrency);

            var remaining = budget.Amount - spent;
            var percentageUsed = budget.Amount > 0 ? (spent / budget.Amount) * 100 : 0;

            response.Add(new BudgetResponse
            {
                Id = budget.Id,
                CategoryId = budget.CategoryId,
                CategoryName = budget.Category.Name,
                Period = budget.Period.ToString(),
                Amount = budget.Amount,
                Currency = budget.Currency,
                StartDate = budget.StartDate,
                EndDate = budget.EndDate,
                Spent = spent,
                Remaining = remaining,
                PercentageUsed = percentageUsed,
                AlertThreshold80 = budget.AlertThreshold80,
                AlertThreshold100 = budget.AlertThreshold100,
                IsActive = budget.IsActive
            });
        }

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<BudgetResponse>> CreateBudget([FromBody] CreateBudgetRequest request)
    {
        var userId = GetUserId();

        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null)
            throw new NotFoundException("Category not found");

        if (!Enum.TryParse<BudgetPeriod>(request.Period, out var period))
        {
            throw new ValidationException("Invalid budget period");
        }

        var budget = new Budget
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CategoryId = request.CategoryId,
            Period = period,
            Amount = request.Amount,
            Currency = request.Currency,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            AlertThreshold80 = request.AlertThreshold80,
            AlertThreshold100 = request.AlertThreshold100,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Budgets.AddAsync(budget);
        await _unitOfWork.SaveChangesAsync();

        var response = new BudgetResponse
        {
            Id = budget.Id,
            CategoryId = budget.CategoryId,
            CategoryName = category.Name,
            Period = budget.Period.ToString(),
            Amount = budget.Amount,
            Currency = budget.Currency,
            StartDate = budget.StartDate,
            EndDate = budget.EndDate,
            Spent = 0,
            Remaining = budget.Amount,
            PercentageUsed = 0,
            AlertThreshold80 = budget.AlertThreshold80,
            AlertThreshold100 = budget.AlertThreshold100,
            IsActive = budget.IsActive
        };

        return StatusCode(201, response);
    }
}
