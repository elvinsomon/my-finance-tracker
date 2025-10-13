#!/bin/bash

# Script para completar la capa API del backend
set -e

BASE_DIR="/Users/elvinsomon/Documents/Proyectos/MyFinanceTracker/backend/FinanceManager.API"

echo "=== Completando capa API ==="

# DTOs Responses
cat > "$BASE_DIR/DTOs/Responses/AuthResponse.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Responses;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserResponse User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}

public class UserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string DefaultCurrency { get; set; } = string.Empty;
}
EOF

cat > "$BASE_DIR/DTOs/Responses/TransactionResponse.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Responses;

public class TransactionResponse
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal ExchangeRate { get; set; }
    public decimal AmountInBaseCurrency { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? Merchant { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
EOF

cat > "$BASE_DIR/DTOs/Responses/PaginatedResponse.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Responses;

public class PaginatedResponse<T>
{
    public IEnumerable<T> Data { get; set; } = new List<T>();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
EOF

cat > "$BASE_DIR/DTOs/Responses/ErrorResponse.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Responses;

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = new();
}
EOF

cat > "$BASE_DIR/DTOs/Responses/CategoryResponse.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Responses;

public class CategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public bool IsSystem { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; }
    public List<CategoryResponse> Subcategories { get; set; } = new();
}
EOF

cat > "$BASE_DIR/DTOs/Responses/BudgetResponse.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Responses;

public class BudgetResponse
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public decimal PercentageUsed { get; set; }
    public bool AlertThreshold80 { get; set; }
    public bool AlertThreshold100 { get; set; }
    public bool IsActive { get; set; }
}
EOF

cat > "$BASE_DIR/DTOs/Responses/AccountResponse.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Responses;

public class AccountResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string? Institution { get; set; }
    public string? AccountNumber { get; set; }
    public bool IsActive { get; set; }
}
EOF

echo "DTOs Responses creados ✓"

# DTOs Requests
cat > "$BASE_DIR/DTOs/Requests/CreateCategoryRequest.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Requests;

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
}
EOF

cat > "$BASE_DIR/DTOs/Requests/CreateBudgetRequest.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Requests;

public class CreateBudgetRequest
{
    public Guid CategoryId { get; set; }
    public string Period { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AlertThreshold80 { get; set; } = true;
    public bool AlertThreshold100 { get; set; } = true;
}
EOF

cat > "$BASE_DIR/DTOs/Requests/CreateAccountRequest.cs" << 'EOF'
namespace FinanceManager.API.DTOs.Requests;

public class CreateAccountRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public string? Institution { get; set; }
    public string? AccountNumber { get; set; }
}
EOF

echo "DTOs Requests creados ✓"

# JWT Service
cat > "$BASE_DIR/Services/JwtService.cs" << 'EOF'
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace FinanceManager.API.Services;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Guid userId, string email)
    {
        var secret = _configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expirationHours = int.Parse(_configuration["Jwt:ExpirationHours"] ?? "24");

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expirationHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public DateTime GetTokenExpiration()
    {
        var expirationHours = int.Parse(_configuration["Jwt:ExpirationHours"] ?? "24");
        return DateTime.UtcNow.AddHours(expirationHours);
    }
}
EOF

# Exception Middleware
cat > "$BASE_DIR/Middleware/ExceptionMiddleware.cs" << 'EOF'
using System.Net;
using System.Text.Json;
using FinanceManager.Core.Exceptions;
using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An error occurred: {Message}", exception.Message);

        context.Response.ContentType = "application/json";

        var errorResponse = new ErrorResponse();

        switch (exception)
        {
            case NotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.Message = exception.Message;
                break;

            case ValidationException validationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.Message = validationException.Message;
                errorResponse.Errors = validationException.Errors;
                break;

            case UnauthorizedException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.Message = exception.Message;
                break;

            case BusinessException:
                context.Response.StatusCode = (int)HttpStatusCode.UnprocessableEntity;
                errorResponse.StatusCode = (int)HttpStatusCode.UnprocessableEntity;
                errorResponse.Message = exception.Message;
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.Message = "An unexpected error occurred";
                errorResponse.Errors = new List<string> { exception.Message };
                break;
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var result = JsonSerializer.Serialize(errorResponse, options);

        return context.Response.WriteAsync(result);
    }
}
EOF

echo "Services y Middleware creados ✓"
echo "Capa API completada ✓"
EOF

chmod +x "$BASE_DIR/complete-api-layer.sh"

bash /Users/elvinsomon/Documents/Proyectos/MyFinanceTracker/backend/complete-api-layer.sh
