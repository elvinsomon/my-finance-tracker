using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Exceptions;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.API.DTOs.Requests;
using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Services;

public class SavingsGoalsService
{
    private readonly IUnitOfWork _unitOfWork;

    public SavingsGoalsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SavingsGoalResponse>> GetAllGoalsAsync(Guid userId, string? status = null)
    {
        SavingsGoalStatus? statusEnum = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<SavingsGoalStatus>(status, true, out var parsedStatus))
        {
            statusEnum = parsedStatus;
        }

        var goals = await _unitOfWork.SavingsGoals.GetByUserIdAsync(userId, statusEnum);
        return goals.Select(MapToResponse);
    }

    public async Task<SavingsGoalResponse> GetGoalByIdAsync(Guid goalId, Guid userId)
    {
        var goal = await _unitOfWork.SavingsGoals.GetByIdWithContributionsAsync(goalId, userId);
        if (goal == null)
            throw new NotFoundException("Savings goal not found");

        return MapToResponse(goal);
    }

    public async Task<SavingsGoalResponse> CreateGoalAsync(CreateSavingsGoalRequest request, Guid userId)
    {
        var goal = new SavingsGoal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            TargetAmount = request.TargetAmount,
            Currency = request.Currency,
            CurrentAmount = 0,
            TargetDate = request.TargetDate,
            Priority = request.Priority,
            Status = SavingsGoalStatus.Active,
            Icon = request.Icon,
            Color = request.Color,
            IsEmergencyFund = request.IsEmergencyFund,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SavingsGoals.AddAsync(goal);
        await _unitOfWork.SaveChangesAsync();

        return MapToResponse(goal);
    }

    public async Task<SavingsGoalResponse> UpdateGoalAsync(Guid goalId, UpdateSavingsGoalRequest request, Guid userId)
    {
        var goal = await _unitOfWork.SavingsGoals.GetByIdAsync(goalId);
        if (goal == null || goal.UserId != userId)
            throw new NotFoundException("Savings goal not found");

        if (!string.IsNullOrEmpty(request.Name))
            goal.Name = request.Name;

        if (request.Description != null)
            goal.Description = request.Description;

        if (request.TargetAmount.HasValue)
            goal.TargetAmount = request.TargetAmount.Value;

        if (request.TargetDate.HasValue)
            goal.TargetDate = request.TargetDate.Value;

        if (request.Priority.HasValue)
            goal.Priority = request.Priority.Value;

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<SavingsGoalStatus>(request.Status, true, out var status))
            goal.Status = status;

        if (request.Icon != null)
            goal.Icon = request.Icon;

        if (request.Color != null)
            goal.Color = request.Color;

        if (request.IsEmergencyFund.HasValue)
            goal.IsEmergencyFund = request.IsEmergencyFund.Value;

        goal.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SavingsGoals.UpdateAsync(goal);
        await _unitOfWork.SaveChangesAsync();

        var updatedGoal = await _unitOfWork.SavingsGoals.GetByIdWithContributionsAsync(goalId, userId);
        return MapToResponse(updatedGoal!);
    }

    public async Task DeleteGoalAsync(Guid goalId, Guid userId)
    {
        var goal = await _unitOfWork.SavingsGoals.GetByIdAsync(goalId);
        if (goal == null || goal.UserId != userId)
            throw new NotFoundException("Savings goal not found");

        await _unitOfWork.SavingsGoals.DeleteAsync(goal);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<IEnumerable<SavingsContributionResponse>> GetContributionsAsync(Guid goalId, Guid userId)
    {
        var goal = await _unitOfWork.SavingsGoals.GetByIdAsync(goalId);
        if (goal == null || goal.UserId != userId)
            throw new NotFoundException("Savings goal not found");

        var contributions = await _unitOfWork.SavingsGoals.GetContributionsByGoalIdAsync(goalId, userId);
        return contributions.Select(MapContributionToResponse);
    }

    public async Task<SavingsContributionResponse> AddContributionAsync(Guid goalId, AddContributionRequest request, Guid userId)
    {
        var goal = await _unitOfWork.SavingsGoals.GetByIdAsync(goalId);
        if (goal == null || goal.UserId != userId)
            throw new NotFoundException("Savings goal not found");

        var transaction = await _unitOfWork.Transactions.GetByIdAsync(request.TransactionId);
        if (transaction == null || transaction.UserId != userId)
            throw new NotFoundException("Transaction not found");

        if (request.Amount > transaction.Amount)
            throw new ValidationException("Contribution amount cannot exceed transaction amount");

        var contribution = new SavingsContribution
        {
            Id = Guid.NewGuid(),
            GoalId = goalId,
            TransactionId = request.TransactionId,
            Amount = request.Amount,
            Date = request.Date,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.SavingsGoals.AddContributionAsync(contribution);

        // Update goal's current amount
        goal.CurrentAmount += request.Amount;

        // Auto-complete goal if target reached
        if (goal.CurrentAmount >= goal.TargetAmount && goal.Status == SavingsGoalStatus.Active)
        {
            goal.Status = SavingsGoalStatus.Completed;
        }

        goal.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SavingsGoals.UpdateAsync(goal);

        await _unitOfWork.SaveChangesAsync();

        // Reload contribution with related data
        var savedContribution = await _unitOfWork.SavingsGoals.GetContributionByIdAsync(contribution.Id, userId);
        return MapContributionToResponse(savedContribution!);
    }

    public async Task DeleteContributionAsync(Guid goalId, Guid contributionId, Guid userId)
    {
        var goal = await _unitOfWork.SavingsGoals.GetByIdAsync(goalId);
        if (goal == null || goal.UserId != userId)
            throw new NotFoundException("Savings goal not found");

        var contribution = await _unitOfWork.SavingsGoals.GetContributionByIdAsync(contributionId, userId);
        if (contribution == null || contribution.GoalId != goalId)
            throw new NotFoundException("Contribution not found");

        // Update goal's current amount
        goal.CurrentAmount -= contribution.Amount;

        // If goal was completed and now is below target, set back to active
        if (goal.Status == SavingsGoalStatus.Completed && goal.CurrentAmount < goal.TargetAmount)
        {
            goal.Status = SavingsGoalStatus.Active;
        }

        goal.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SavingsGoals.UpdateAsync(goal);

        await _unitOfWork.SavingsGoals.DeleteContributionAsync(contribution);
        await _unitOfWork.SaveChangesAsync();
    }

    private SavingsGoalResponse MapToResponse(SavingsGoal goal)
    {
        var progress = goal.TargetAmount > 0 ? (goal.CurrentAmount / goal.TargetAmount) * 100 : 0;
        var remaining = goal.TargetAmount - goal.CurrentAmount;

        return new SavingsGoalResponse
        {
            Id = goal.Id,
            Name = goal.Name,
            Description = goal.Description,
            TargetAmount = goal.TargetAmount,
            Currency = goal.Currency,
            CurrentAmount = goal.CurrentAmount,
            TargetDate = goal.TargetDate,
            Priority = goal.Priority,
            Status = goal.Status.ToString(),
            Icon = goal.Icon,
            Color = goal.Color,
            IsEmergencyFund = goal.IsEmergencyFund,
            Progress = Math.Round(progress, 2),
            RemainingAmount = remaining > 0 ? remaining : 0,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };
    }

    private SavingsContributionResponse MapContributionToResponse(SavingsContribution contribution)
    {
        return new SavingsContributionResponse
        {
            Id = contribution.Id,
            GoalId = contribution.GoalId,
            TransactionId = contribution.TransactionId,
            Amount = contribution.Amount,
            Date = contribution.Date,
            Notes = contribution.Notes,
            CreatedAt = contribution.CreatedAt,
            Transaction = contribution.Transaction != null ? new TransactionBasicInfo
            {
                Id = contribution.Transaction.Id,
                Description = contribution.Transaction.Description,
                Type = contribution.Transaction.Type.ToString(),
                Amount = contribution.Transaction.Amount,
                Currency = contribution.Transaction.Currency
            } : null
        };
    }
}
