#!/bin/bash

# Este script genera todos los archivos necesarios para el backend de MyFinanceTracker
# Ejecutar con: bash setup-backend.sh

set -e

BASE_DIR="/Users/elvinsomon/Documents/Proyectos/MyFinanceTracker/backend"

echo "Generando estructura del backend de MyFinanceTracker..."

# ===== CORE ENTITIES =====

cat > "$BASE_DIR/FinanceManager.Core/Entities/User.cs" << 'EOF'
using System;

namespace FinanceManager.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string DefaultCurrency { get; set; } = "DOP";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public ICollection<FinancialAccount> FinancialAccounts { get; set; } = new List<FinancialAccount>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Entities/FinancialAccount.cs" << 'EOF'
using System;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Entities;

public class FinancialAccount
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public string? Institution { get; set; }
    public string? AccountNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Entities/Category.cs" << 'EOF'
using System;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Entities;

public class Category
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public Guid? ParentCategoryId { get; set; }
    public bool IsSystem { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> Subcategories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Entities/Transaction.cs" << 'EOF'
using System;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal ExchangeRate { get; set; } = 1;
    public decimal AmountInBaseCurrency { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? PaymentMethod { get; set; }
    public string? Merchant { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Completed;
    public string? Notes { get; set; }
    public string? AttachmentUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public FinancialAccount Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Entities/Budget.cs" << 'EOF'
using System;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Entities;

public class Budget
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }
    public BudgetPeriod Period { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool AlertThreshold80 { get; set; } = true;
    public bool AlertThreshold100 { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Entities/ExchangeRate.cs" << 'EOF'
using System;

namespace FinanceManager.Core.Entities;

public class ExchangeRate
{
    public Guid Id { get; set; }
    public string FromCurrency { get; set; } = string.Empty;
    public string ToCurrency { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public DateTime Date { get; set; }
    public string Source { get; set; } = "Manual";
    public DateTime CreatedAt { get; set; }
}
EOF

echo "Entidades Core creadas ✓"

# ===== CORE EXCEPTIONS =====

cat > "$BASE_DIR/FinanceManager.Core/Exceptions/NotFoundException.cs" << 'EOF'
namespace FinanceManager.Core.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Exceptions/ValidationException.cs" << 'EOF'
namespace FinanceManager.Core.Exceptions;

public class ValidationException : Exception
{
    public List<string> Errors { get; }

    public ValidationException(string message) : base(message)
    {
        Errors = new List<string> { message };
    }

    public ValidationException(List<string> errors) : base("Validation failed")
    {
        Errors = errors;
    }
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Exceptions/UnauthorizedException.cs" << 'EOF'
namespace FinanceManager.Core.Exceptions;

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Exceptions/BusinessException.cs" << 'EOF'
namespace FinanceManager.Core.Exceptions;

public class BusinessException : Exception
{
    public BusinessException(string message) : base(message)
    {
    }
}
EOF

echo "Excepciones Core creadas ✓"

# ===== CORE INTERFACES =====

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/IRepository.cs" << 'EOF'
namespace FinanceManager.Core.Interfaces.Repositories;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/IUserRepository.cs" << 'EOF'
using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/ITransactionRepository.cs" << 'EOF'
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<(IEnumerable<Transaction> Items, int TotalCount)> GetPagedAsync(
        Guid userId,
        int page,
        int pageSize,
        DateTime? startDate = null,
        DateTime? endDate = null,
        TransactionType? type = null,
        Guid? categoryId = null,
        Guid? accountId = null);

    Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId);
    Task<IEnumerable<Transaction>> GetByCategoryAndDateRangeAsync(Guid categoryId, DateTime startDate, DateTime endDate);
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/ICategoryRepository.cs" << 'EOF'
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<IEnumerable<Category>> GetByUserIdAsync(Guid? userId, TransactionType? type = null, bool includeInactive = false);
    Task<IEnumerable<Category>> GetSystemCategoriesAsync(TransactionType? type = null);
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/IBudgetRepository.cs" << 'EOF'
using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IBudgetRepository : IRepository<Budget>
{
    Task<IEnumerable<Budget>> GetByUserIdAsync(Guid userId, bool? isActive = null);
    Task<IEnumerable<Budget>> GetActiveBudgetsForDateAsync(Guid userId, DateTime date);
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/IFinancialAccountRepository.cs" << 'EOF'
using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IFinancialAccountRepository : IRepository<FinancialAccount>
{
    Task<IEnumerable<FinancialAccount>> GetByUserIdAsync(Guid userId);
    Task UpdateBalanceAsync(Guid accountId, decimal newBalance);
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/IExchangeRateRepository.cs" << 'EOF'
using FinanceManager.Core.Entities;

namespace FinanceManager.Core.Interfaces.Repositories;

public interface IExchangeRateRepository : IRepository<ExchangeRate>
{
    Task<ExchangeRate?> GetRateAsync(string fromCurrency, string toCurrency, DateTime date);
    Task<IEnumerable<ExchangeRate>> GetRatesAsync(string? fromCurrency = null, string? toCurrency = null, DateTime? date = null);
}
EOF

cat > "$BASE_DIR/FinanceManager.Core/Interfaces/Repositories/IUnitOfWork.cs" << 'EOF'
namespace FinanceManager.Core.Interfaces.Repositories;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    ITransactionRepository Transactions { get; }
    ICategoryRepository Categories { get; }
    IBudgetRepository Budgets { get; }
    IFinancialAccountRepository FinancialAccounts { get; }
    IExchangeRateRepository ExchangeRates { get; }

    Task<int> SaveChangesAsync();
}
EOF

echo "Interfaces Core creadas ✓"

echo "Core layer completado ✓"
echo "Estructura del backend generada exitosamente!"
EOF

chmod +x "$BASE_DIR/setup-backend.sh"
