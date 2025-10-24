using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FinanceManager.API.Services;
using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportsService _reportsService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        ReportsService reportsService,
        ILogger<ReportsController> logger)
    {
        _reportsService = reportsService;
        _logger = logger;
    }

    /// <summary>
    /// Get spending distribution by category for a date range
    /// </summary>
    [HttpGet("spending-by-category")]
    public async Task<ActionResult<SpendingByCategoryResponse>> GetSpendingByCategory(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation(
                "Getting spending by category for user {UserId} from {StartDate} to {EndDate}",
                userId, startDate, endDate);

            var result = await _reportsService.GetSpendingByCategoryAsync(userId, startDate, endDate);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for spending by category report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting spending by category report");
            throw;
        }
    }

    /// <summary>
    /// Get income/expense trends for the last N months
    /// </summary>
    [HttpGet("trends")]
    public async Task<ActionResult<TrendsResponse>> GetTrends([FromQuery] int months = 12)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation(
                "Getting trends for user {UserId} for {Months} months",
                userId, months);

            var result = await _reportsService.GetTrendsAsync(userId, months);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for trends report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting trends report");
            throw;
        }
    }

    /// <summary>
    /// Compare two periods (current vs previous)
    /// </summary>
    [HttpGet("comparison")]
    public async Task<ActionResult<ComparisonResponse>> GetComparison(
        [FromQuery] DateTime currentStart,
        [FromQuery] DateTime currentEnd,
        [FromQuery] DateTime previousStart,
        [FromQuery] DateTime previousEnd)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation(
                "Getting comparison for user {UserId}. Current: {CurrentStart} to {CurrentEnd}, Previous: {PreviousStart} to {PreviousEnd}",
                userId, currentStart, currentEnd, previousStart, previousEnd);

            var result = await _reportsService.GetComparisonAsync(
                userId,
                currentStart,
                currentEnd,
                previousStart,
                previousEnd);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for comparison report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting comparison report");
            throw;
        }
    }

    /// <summary>
    /// Get cashflow summary for a full year
    /// </summary>
    [HttpGet("cashflow")]
    public async Task<ActionResult<CashflowResponse>> GetCashflow([FromQuery] int year)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation(
                "Getting cashflow for user {UserId} for year {Year}",
                userId, year);

            var result = await _reportsService.GetCashflowAsync(userId, year);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for cashflow report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cashflow report");
            throw;
        }
    }

    /// <summary>
    /// Get top expenses for a date range
    /// </summary>
    [HttpGet("top-expenses")]
    public async Task<ActionResult<TopExpensesResponse>> GetTopExpenses(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] int limit = 10)
    {
        try
        {
            var userId = GetUserId();
            _logger.LogInformation(
                "Getting top {Limit} expenses for user {UserId} from {StartDate} to {EndDate}",
                limit, userId, startDate, endDate);

            var result = await _reportsService.GetTopExpensesAsync(userId, startDate, endDate, limit);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for top expenses report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting top expenses report");
            throw;
        }
    }

    /// <summary>
    /// Extract user ID from JWT claims
    /// </summary>
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID format");
        }

        return userId;
    }
}
