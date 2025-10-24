using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Core.Exceptions;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Core.Validators;
using FinanceManager.API.DTOs.Responses;
using Mapster;

namespace FinanceManager.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly CreateTransactionValidator _createValidator;
    private readonly UpdateTransactionValidator _updateValidator;

    public TransactionsController(
        IUnitOfWork unitOfWork,
        CreateTransactionValidator createValidator,
        UpdateTransactionValidator updateValidator)
    {
        _unitOfWork = unitOfWork;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null)
            throw new UnauthorizedException("User not authenticated");

        return Guid.Parse(userIdClaim.Value);
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<TransactionResponse>>> GetTransactions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? type = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? accountId = null)
    {
        var userId = GetUserId();

        if (pageSize > 100) pageSize = 100;

        TransactionType? transactionType = null;
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<TransactionType>(type, out var parsedType))
        {
            transactionType = parsedType;
        }

        var (items, totalCount) = await _unitOfWork.Transactions.GetPagedAsync(
            userId, page, pageSize, startDate, endDate, transactionType, categoryId, accountId);

        var transactionResponses = items.Select(t => new TransactionResponse
        {
            Id = t.Id,
            AccountId = t.AccountId,
            AccountName = t.Account.Name,
            CategoryId = t.CategoryId,
            CategoryName = t.Category.Name,
            Type = t.Type.ToString(),
            Amount = t.Amount,
            Currency = t.Currency,
            ExchangeRate = t.ExchangeRate,
            AmountInBaseCurrency = t.AmountInBaseCurrency,
            Date = t.Date,
            Description = t.Description,
            PaymentMethod = t.PaymentMethod,
            Merchant = t.Merchant,
            Status = t.Status.ToString(),
            Notes = t.Notes,
            AttachmentUrl = t.AttachmentUrl,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToList();

        return Ok(new PaginatedResponse<TransactionResponse>
        {
            Data = transactionResponses,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionResponse>> GetTransaction(Guid id)
    {
        var userId = GetUserId();
        var transaction = await _unitOfWork.Transactions.GetByIdWithItemsAsync(id);

        if (transaction == null || transaction.UserId != userId)
            throw new NotFoundException("Transaction not found");

        var response = new TransactionResponse
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            AccountName = transaction.Account.Name,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category.Name,
            Type = transaction.Type.ToString(),
            Amount = transaction.Amount,
            Currency = transaction.Currency,
            ExchangeRate = transaction.ExchangeRate,
            AmountInBaseCurrency = transaction.AmountInBaseCurrency,
            Date = transaction.Date,
            Description = transaction.Description,
            PaymentMethod = transaction.PaymentMethod,
            Merchant = transaction.Merchant,
            Status = transaction.Status.ToString(),
            Notes = transaction.Notes,
            AttachmentUrl = transaction.AttachmentUrl,
            CreatedAt = transaction.CreatedAt,
            UpdatedAt = transaction.UpdatedAt,
            Items = transaction.Items.Select(i => new TransactionItemResponse
            {
                Id = i.Id,
                TransactionId = i.TransactionId,
                CategoryId = i.CategoryId,
                CategoryName = i.Category.Name,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalAmount = i.TotalAmount,
                Notes = i.Notes,
                CreatedAt = i.CreatedAt
            }).ToList()
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionResponse>> CreateTransaction([FromBody] CreateTransactionRequest request)
    {
        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var userId = GetUserId();

        // Verify account belongs to user
        var account = await _unitOfWork.FinancialAccounts.GetByIdAsync(request.AccountId);
        if (account == null || account.UserId != userId)
            throw new NotFoundException("Account not found");

        // Verify category exists
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId);
        if (category == null)
            throw new NotFoundException("Category not found");

        // Validate items if present
        if (request.Items != null && request.Items.Any())
        {
            // Validate items sum equals transaction amount
            var itemsTotal = request.Items.Sum(i => i.TotalAmount);
            if (Math.Abs(itemsTotal - request.Amount) > 0.01m)
            {
                throw new ValidationException(new List<string>
                {
                    $"Sum of items ({itemsTotal}) must equal transaction amount ({request.Amount})"
                });
            }

            // Validate each item
            foreach (var item in request.Items)
            {
                if (item.CategoryId.HasValue)
                {
                    var itemCategory = await _unitOfWork.Categories.GetByIdAsync(item.CategoryId.Value);
                    if (itemCategory == null)
                        throw new NotFoundException($"Category not found for item: {item.Description}");
                }

                // Validate TotalAmount = Quantity × UnitPrice
                if (Math.Abs(item.TotalAmount - (item.Quantity * item.UnitPrice)) > 0.01m)
                {
                    throw new ValidationException(new List<string>
                    {
                        $"Item '{item.Description}': TotalAmount must equal Quantity × UnitPrice"
                    });
                }
            }
        }

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            Type = Enum.Parse<TransactionType>(request.Type),
            Amount = request.Amount,
            Currency = request.Currency,
            ExchangeRate = 1, // TODO: Get actual exchange rate
            AmountInBaseCurrency = request.Amount, // TODO: Calculate with exchange rate
            Date = request.Date,
            Description = request.Description,
            PaymentMethod = request.PaymentMethod,
            Merchant = request.Merchant,
            Status = TransactionStatus.Completed,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Add items if present
        if (request.Items != null && request.Items.Any())
        {
            foreach (var itemRequest in request.Items)
            {
                var item = new TransactionItem
                {
                    Id = Guid.NewGuid(),
                    TransactionId = transaction.Id,
                    CategoryId = itemRequest.CategoryId ?? request.CategoryId,
                    Description = itemRequest.Description,
                    Quantity = itemRequest.Quantity,
                    UnitPrice = itemRequest.UnitPrice,
                    TotalAmount = itemRequest.TotalAmount,
                    Notes = itemRequest.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                transaction.Items.Add(item);
            }
        }

        await _unitOfWork.Transactions.AddAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        // Reload to get navigation properties
        transaction = await _unitOfWork.Transactions.GetByIdWithItemsAsync(transaction.Id);

        var response = new TransactionResponse
        {
            Id = transaction!.Id,
            AccountId = transaction.AccountId,
            AccountName = transaction.Account.Name,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category.Name,
            Type = transaction.Type.ToString(),
            Amount = transaction.Amount,
            Currency = transaction.Currency,
            ExchangeRate = transaction.ExchangeRate,
            AmountInBaseCurrency = transaction.AmountInBaseCurrency,
            Date = transaction.Date,
            Description = transaction.Description,
            PaymentMethod = transaction.PaymentMethod,
            Merchant = transaction.Merchant,
            Status = transaction.Status.ToString(),
            Notes = transaction.Notes,
            CreatedAt = transaction.CreatedAt,
            Items = transaction.Items.Select(i => new TransactionItemResponse
            {
                Id = i.Id,
                TransactionId = i.TransactionId,
                CategoryId = i.CategoryId,
                CategoryName = i.Category.Name,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalAmount = i.TotalAmount,
                Notes = i.Notes,
                CreatedAt = i.CreatedAt
            }).ToList()
        };

        return StatusCode(201, response);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionResponse>> UpdateTransaction(Guid id, [FromBody] UpdateTransactionRequest request)
    {
        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var userId = GetUserId();
        var transaction = await _unitOfWork.Transactions.GetByIdWithItemsAsync(id);

        if (transaction == null || transaction.UserId != userId)
            throw new NotFoundException("Transaction not found");

        // Update only provided fields
        if (request.AccountId.HasValue)
        {
            var account = await _unitOfWork.FinancialAccounts.GetByIdAsync(request.AccountId.Value);
            if (account == null || account.UserId != userId)
                throw new NotFoundException("Account not found");
            transaction.AccountId = request.AccountId.Value;
        }

        if (request.CategoryId.HasValue)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId.Value);
            if (category == null)
                throw new NotFoundException("Category not found");
            transaction.CategoryId = request.CategoryId.Value;
        }

        if (request.Amount.HasValue)
            transaction.Amount = request.Amount.Value;

        if (request.Date.HasValue)
            transaction.Date = request.Date.Value;

        if (request.Description != null)
            transaction.Description = request.Description;

        if (request.PaymentMethod != null)
            transaction.PaymentMethod = request.PaymentMethod;

        if (request.Merchant != null)
            transaction.Merchant = request.Merchant;

        if (request.Notes != null)
            transaction.Notes = request.Notes;

        // Handle items update
        if (request.Items != null)
        {
            // Validate items sum equals transaction amount
            if (request.Items.Any())
            {
                var itemsTotal = request.Items.Sum(i => i.TotalAmount);
                var amountToValidate = request.Amount ?? transaction.Amount;

                if (Math.Abs(itemsTotal - amountToValidate) > 0.01m)
                {
                    throw new ValidationException(new List<string>
                    {
                        $"Sum of items ({itemsTotal}) must equal transaction amount ({amountToValidate})"
                    });
                }

                // Validate each item
                foreach (var item in request.Items)
                {
                    if (item.CategoryId.HasValue)
                    {
                        var itemCategory = await _unitOfWork.Categories.GetByIdAsync(item.CategoryId.Value);
                        if (itemCategory == null)
                            throw new NotFoundException($"Category not found for item: {item.Description}");
                    }

                    // Validate TotalAmount = Quantity × UnitPrice
                    if (Math.Abs(item.TotalAmount - (item.Quantity * item.UnitPrice)) > 0.01m)
                    {
                        throw new ValidationException(new List<string>
                        {
                            $"Item '{item.Description}': TotalAmount must equal Quantity × UnitPrice"
                        });
                    }
                }

                // Remove existing items
                transaction.Items.Clear();

                // Add new items
                foreach (var itemRequest in request.Items)
                {
                    var item = new TransactionItem
                    {
                        Id = Guid.NewGuid(),
                        TransactionId = transaction.Id,
                        CategoryId = itemRequest.CategoryId ?? (request.CategoryId ?? transaction.CategoryId),
                        Description = itemRequest.Description,
                        Quantity = itemRequest.Quantity,
                        UnitPrice = itemRequest.UnitPrice,
                        TotalAmount = itemRequest.TotalAmount,
                        Notes = itemRequest.Notes,
                        CreatedAt = DateTime.UtcNow
                    };
                    transaction.Items.Add(item);
                }
            }
            else
            {
                // Empty items list means remove all items
                transaction.Items.Clear();
            }
        }

        await _unitOfWork.Transactions.UpdateAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        // Reload to get navigation properties
        transaction = await _unitOfWork.Transactions.GetByIdWithItemsAsync(id);

        var response = new TransactionResponse
        {
            Id = transaction!.Id,
            AccountId = transaction.AccountId,
            AccountName = transaction.Account.Name,
            CategoryId = transaction.CategoryId,
            CategoryName = transaction.Category.Name,
            Type = transaction.Type.ToString(),
            Amount = transaction.Amount,
            Currency = transaction.Currency,
            ExchangeRate = transaction.ExchangeRate,
            AmountInBaseCurrency = transaction.AmountInBaseCurrency,
            Date = transaction.Date,
            Description = transaction.Description,
            PaymentMethod = transaction.PaymentMethod,
            Merchant = transaction.Merchant,
            Status = transaction.Status.ToString(),
            Notes = transaction.Notes,
            UpdatedAt = transaction.UpdatedAt,
            CreatedAt = transaction.CreatedAt,
            Items = transaction.Items.Select(i => new TransactionItemResponse
            {
                Id = i.Id,
                TransactionId = i.TransactionId,
                CategoryId = i.CategoryId,
                CategoryName = i.Category.Name,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalAmount = i.TotalAmount,
                Notes = i.Notes,
                CreatedAt = i.CreatedAt
            }).ToList()
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(Guid id)
    {
        var userId = GetUserId();
        var transaction = await _unitOfWork.Transactions.GetByIdAsync(id);

        if (transaction == null || transaction.UserId != userId)
            throw new NotFoundException("Transaction not found");

        await _unitOfWork.Transactions.DeleteAsync(transaction);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}
