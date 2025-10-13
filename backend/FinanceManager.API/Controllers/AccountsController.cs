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
public class AccountsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public AccountsController(IUnitOfWork unitOfWork)
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
    public async Task<ActionResult<IEnumerable<AccountResponse>>> GetAccounts()
    {
        var userId = GetUserId();
        var accounts = await _unitOfWork.FinancialAccounts.GetByUserIdAsync(userId);

        var response = accounts.Select(a => new AccountResponse
        {
            Id = a.Id,
            Name = a.Name,
            Type = a.Type.ToString(),
            Currency = a.Currency,
            InitialBalance = a.InitialBalance,
            CurrentBalance = a.CurrentBalance,
            Institution = a.Institution,
            AccountNumber = a.AccountNumber,
            IsActive = a.IsActive
        });

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<AccountResponse>> CreateAccount([FromBody] CreateAccountRequest request)
    {
        var userId = GetUserId();

        if (!Enum.TryParse<AccountType>(request.Type, out var accountType))
        {
            throw new ValidationException("Invalid account type");
        }

        var account = new FinancialAccount
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Type = accountType,
            Currency = request.Currency,
            InitialBalance = request.InitialBalance,
            CurrentBalance = request.InitialBalance,
            Institution = request.Institution,
            AccountNumber = request.AccountNumber,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.FinancialAccounts.AddAsync(account);
        await _unitOfWork.SaveChangesAsync();

        var response = new AccountResponse
        {
            Id = account.Id,
            Name = account.Name,
            Type = account.Type.ToString(),
            Currency = account.Currency,
            InitialBalance = account.InitialBalance,
            CurrentBalance = account.CurrentBalance,
            Institution = account.Institution,
            AccountNumber = account.AccountNumber,
            IsActive = account.IsActive
        };

        return StatusCode(201, response);
    }
}
