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
public class CategoriesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoriesController(IUnitOfWork unitOfWork)
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
    public async Task<ActionResult<IEnumerable<CategoryResponse>>> GetCategories(
        [FromQuery] string? type = null,
        [FromQuery] bool includeInactive = false)
    {
        var userId = GetUserId();

        TransactionType? transactionType = null;
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<TransactionType>(type, out var parsedType))
        {
            transactionType = parsedType;
        }

        var categories = await _unitOfWork.Categories.GetByUserIdAsync(userId, transactionType, includeInactive);

        var response = categories.Select(c => new CategoryResponse
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type.ToString(),
            ParentCategoryId = c.ParentCategoryId,
            IsSystem = c.IsSystem,
            Icon = c.Icon,
            Color = c.Color,
            IsActive = c.IsActive,
            Subcategories = c.Subcategories.Select(sc => new CategoryResponse
            {
                Id = sc.Id,
                Name = sc.Name,
                Type = sc.Type.ToString(),
                ParentCategoryId = sc.ParentCategoryId,
                IsSystem = sc.IsSystem,
                Icon = sc.Icon,
                Color = sc.Color,
                IsActive = sc.IsActive
            }).ToList()
        }).ToList();

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponse>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var userId = GetUserId();

        if (!Enum.TryParse<TransactionType>(request.Type, out var type))
        {
            throw new ValidationException("Invalid transaction type");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Type = type,
            ParentCategoryId = request.ParentCategoryId,
            IsSystem = false,
            Icon = request.Icon,
            Color = request.Color,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        var response = new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type.ToString(),
            ParentCategoryId = category.ParentCategoryId,
            IsSystem = category.IsSystem,
            Icon = category.Icon,
            Color = category.Color,
            IsActive = category.IsActive
        };

        return StatusCode(201, response);
    }
}
