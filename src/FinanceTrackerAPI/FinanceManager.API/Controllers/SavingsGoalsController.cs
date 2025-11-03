using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FluentValidation;
using FinanceManager.Core.Exceptions;
using FinanceManager.API.DTOs.Requests;
using FinanceManager.API.DTOs.Responses;
using FinanceManager.API.Services;
using FinanceManager.API.Validators;

namespace FinanceManager.API.Controllers;

[Authorize]
[ApiController]
[Route("api/savings-goals")]
public class SavingsGoalsController(
    SavingsGoalsService service,
    IValidator<CreateSavingsGoalRequest> createValidator,
    IValidator<UpdateSavingsGoalRequest> updateValidator,
    IValidator<AddContributionRequest> contributionValidator)
        : ControllerBase
{
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedException("User not authenticated");
        return Guid.Parse(userIdClaim.Value);
    }

    /// <summary>
    /// Get all savings goals for the authenticated user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SavingsGoalResponse>>> GetAllGoals([FromQuery] string? status = null)
    {
        var userId = GetUserId();
        var goals = await service.GetAllGoalsAsync(userId, status);
        return Ok(goals);
    }

    /// <summary>
    /// Get a specific savings goal by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<SavingsGoalResponse>> GetGoalById(Guid id)
    {
        var userId = GetUserId();
        var goal = await service.GetGoalByIdAsync(id, userId);
        return Ok(goal);
    }

    /// <summary>
    /// Create a new savings goal
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SavingsGoalResponse>> CreateGoal([FromBody] CreateSavingsGoalRequest request)
    {
        var validationResult = await createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var userId = GetUserId();
        var goal = await service.CreateGoalAsync(request, userId);
        return StatusCode(201, goal);
    }

    /// <summary>
    /// Update an existing savings goal
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<SavingsGoalResponse>> UpdateGoal(Guid id, [FromBody] UpdateSavingsGoalRequest request)
    {
        var validationResult = await updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var userId = GetUserId();
        var goal = await service.UpdateGoalAsync(id, request, userId);
        return Ok(goal);
    }

    /// <summary>
    /// Delete a savings goal
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteGoal(Guid id)
    {
        var userId = GetUserId();
        await service.DeleteGoalAsync(id, userId);
        return NoContent();
    }

    /// <summary>
    /// Get all contributions for a specific savings goal
    /// </summary>
    [HttpGet("{goalId}/contributions")]
    public async Task<ActionResult<IEnumerable<SavingsContributionResponse>>> GetContributions(Guid goalId)
    {
        var userId = GetUserId();
        var contributions = await service.GetContributionsAsync(goalId, userId);
        return Ok(contributions);
    }

    /// <summary>
    /// Add a contribution to a savings goal
    /// </summary>
    [HttpPost("{goalId}/contributions")]
    public async Task<ActionResult<SavingsContributionResponse>> AddContribution(Guid goalId, [FromBody] AddContributionRequest request)
    {
        var validationResult = await contributionValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { errors = validationResult.Errors.Select(e => e.ErrorMessage) });
        }

        var userId = GetUserId();
        var contribution = await service.AddContributionAsync(goalId, request, userId);
        return StatusCode(201, contribution);
    }

    /// <summary>
    /// Delete a contribution from a savings goal
    /// </summary>
    [HttpDelete("{goalId}/contributions/{contributionId}")]
    public async Task<ActionResult> DeleteContribution(Guid goalId, Guid contributionId)
    {
        var userId = GetUserId();
        await service.DeleteContributionAsync(goalId, contributionId, userId);
        return NoContent();
    }
}
