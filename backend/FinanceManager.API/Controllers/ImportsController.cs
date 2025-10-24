using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FinanceManager.Core.Exceptions;
using FinanceManager.API.DTOs.Requests;
using FinanceManager.API.DTOs.Responses;
using FinanceManager.API.Services;

namespace FinanceManager.API.Controllers;

[Authorize]
[ApiController]
[Route("api/imports")]
public class ImportsController : ControllerBase
{
    private readonly ImportService _importService;

    public ImportsController(ImportService importService)
    {
        _importService = importService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedException("User not authenticated");
        return Guid.Parse(userIdClaim.Value);
    }

    /// <summary>
    /// Upload a CSV file and get initial analysis with preview
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<UploadCsvResponse>> Upload([FromForm] UploadCsvRequest request)
    {
        try
        {
            var userId = GetUserId();
            var response = await _importService.UploadCsvAsync(
                request.File,
                request.FinancialAccountId,
                request.Currency,
                userId
            );

            return Ok(response);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error uploading file", details = ex.Message });
        }
    }

    /// <summary>
    /// Get full preview of uploaded CSV file
    /// </summary>
    [HttpGet("{uploadId}/preview")]
    public async Task<ActionResult<List<ImportedTransactionDto>>> GetPreview(Guid uploadId)
    {
        try
        {
            var userId = GetUserId();
            var preview = await _importService.GetPreviewAsync(uploadId, userId);
            return Ok(preview);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving preview", details = ex.Message });
        }
    }

    /// <summary>
    /// Confirm and execute the import
    /// </summary>
    [HttpPost("{uploadId}/confirm")]
    public async Task<ActionResult<ConfirmImportResponse>> Confirm(
        Guid uploadId,
        [FromBody] ConfirmImportRequest request)
    {
        try
        {
            if (request.UploadId != uploadId)
            {
                return BadRequest(new { message = "Upload ID mismatch" });
            }

            var userId = GetUserId();
            var response = await _importService.ConfirmImportAsync(
                uploadId,
                request.CategoryAssignments,
                userId
            );

            return Ok(response);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (BusinessException ex)
        {
            return UnprocessableEntity(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error confirming import", details = ex.Message });
        }
    }

    /// <summary>
    /// Get import history for the authenticated user
    /// </summary>
    [HttpGet("history")]
    public async Task<ActionResult<object>> GetHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var userId = GetUserId();
            var (items, totalCount) = await _importService.GetHistoryAsync(userId, page, pageSize);

            return Ok(new
            {
                items,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving import history", details = ex.Message });
        }
    }
}
