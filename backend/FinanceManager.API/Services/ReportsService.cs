using Microsoft.EntityFrameworkCore;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Core.Enums;
using FinanceManager.API.DTOs.Responses;

namespace FinanceManager.API.Services;

public class ReportsService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReportsService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Get spending distribution by category for a date range
    /// </summary>
    public async Task<SpendingByCategoryResponse> GetSpendingByCategoryAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate)
    {
        // Validate date range
        if (startDate > endDate)
        {
            throw new ArgumentException("Start date cannot be after end date");
        }

        // Get all transactions and filter
        var allTransactions = await _unitOfWork.Transactions.GetAllAsync();

        var transactions = allTransactions
            .Where(t => t.UserId == userId
                && t.Type == TransactionType.Expense
                && t.Date >= startDate      
                && t.Date <= endDate
                && t.Status == TransactionStatus.Completed)
            .ToList();

        // Group by category and calculate totals
        var categoryGroups = transactions
            .GroupBy(t => new { t.CategoryId, CategoryName = t.Category?.Name ?? "Uncategorized", CategoryColor = t.Category?.Color ?? "#94a3b8" })
            .Select(g => new CategorySpending
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.CategoryName,
                TotalAmount = g.Sum(t => t.AmountInBaseCurrency),
                TransactionCount = g.Count(),
                Color = g.Key.CategoryColor
            })
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        var totalSpending = categoryGroups.Sum(c => c.TotalAmount);

        // Calculate percentages
        foreach (var category in categoryGroups)
        {
            category.Percentage = totalSpending > 0
                ? Math.Round((category.TotalAmount / totalSpending) * 100, 2)
                : 0;
        }

        return new SpendingByCategoryResponse
        {
            Period = new PeriodInfo
            {
                StartDate = startDate,
                EndDate = endDate
            },
            Categories = categoryGroups,
            TotalSpending = totalSpending
        };
    }

    /// <summary>
    /// Get income/expense trends for the last N months
    /// </summary>
    public async Task<TrendsResponse> GetTrendsAsync(Guid userId, int months)
    {
        if (months <= 0 || months > 24)
        {
            throw new ArgumentException("Months must be between 1 and 24");
        }

        var endDate = DateTime.UtcNow;
        var startDate = endDate.AddMonths(-months);

        // Get all transactions and filter
        var allTransactions = await _unitOfWork.Transactions.GetAllAsync();

        var transactions = allTransactions
            .Where(t => t.UserId == userId
                && t.Date >= startDate
                && t.Date <= endDate
                && t.Status == TransactionStatus.Completed)
            .ToList();

        // Group by month
        var monthlyData = new List<MonthlyTrend>();

        for (int i = 0; i < months; i++)
        {
            var monthStart = startDate.AddMonths(i);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            var monthTransactions = transactions
                .Where(t => t.Date >= monthStart && t.Date <= monthEnd)
                .ToList();

            var income = monthTransactions
                .Where(t => t.Type == TransactionType.Income)
                .Sum(t => t.AmountInBaseCurrency);

            var expenses = monthTransactions
                .Where(t => t.Type == TransactionType.Expense)
                .Sum(t => t.AmountInBaseCurrency);

            var savings = income - expenses;

            monthlyData.Add(new MonthlyTrend
            {
                Month = monthStart.ToString("yyyy-MM"),
                Income = income,
                Expenses = expenses,
                Savings = savings,
                NetCashflow = savings
            });
        }

        return new TrendsResponse
        {
            Months = monthlyData,
            AverageMonthlyIncome = monthlyData.Count > 0
                ? Math.Round(monthlyData.Average(m => m.Income), 2)
                : 0,
            AverageMonthlyExpenses = monthlyData.Count > 0
                ? Math.Round(monthlyData.Average(m => m.Expenses), 2)
                : 0,
            AverageMonthlySavings = monthlyData.Count > 0
                ? Math.Round(monthlyData.Average(m => m.Savings), 2)
                : 0
        };
    }

    /// <summary>
    /// Compare two periods (current vs previous)
    /// </summary>
    public async Task<ComparisonResponse> GetComparisonAsync(
        Guid userId,
        DateTime currentStart,
        DateTime currentEnd,
        DateTime previousStart,
        DateTime previousEnd)
    {
        // Validate date ranges
        if (currentStart > currentEnd)
        {
            throw new ArgumentException("Current start date cannot be after current end date");
        }
        if (previousStart > previousEnd)
        {
            throw new ArgumentException("Previous start date cannot be after previous end date");
        }

        // Get all transactions and filter for both periods
        var allTransactions = await _unitOfWork.Transactions.GetAllAsync();

        var currentTransactions = allTransactions
            .Where(t => t.UserId == userId
                && t.Date >= currentStart
                && t.Date <= currentEnd
                && t.Status == TransactionStatus.Completed)
            .ToList();

        var previousTransactions = allTransactions
            .Where(t => t.UserId == userId
                && t.Date >= previousStart
                && t.Date <= previousEnd
                && t.Status == TransactionStatus.Completed)
            .ToList();

        // Calculate current period metrics
        var currentIncome = currentTransactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.AmountInBaseCurrency);
        var currentExpenses = currentTransactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.AmountInBaseCurrency);
        var currentSavings = currentIncome - currentExpenses;

        // Calculate previous period metrics
        var previousIncome = previousTransactions
            .Where(t => t.Type == TransactionType.Income)
            .Sum(t => t.AmountInBaseCurrency);
        var previousExpenses = previousTransactions
            .Where(t => t.Type == TransactionType.Expense)
            .Sum(t => t.AmountInBaseCurrency);
        var previousSavings = previousIncome - previousExpenses;

        // Calculate changes
        var incomeChange = currentIncome - previousIncome;
        var expensesChange = currentExpenses - previousExpenses;
        var savingsChange = currentSavings - previousSavings;

        return new ComparisonResponse
        {
            Current = new PeriodSummary
            {
                Period = currentStart.ToString("yyyy-MM"),
                Income = currentIncome,
                Expenses = currentExpenses,
                Savings = currentSavings
            },
            Previous = new PeriodSummary
            {
                Period = previousStart.ToString("yyyy-MM"),
                Income = previousIncome,
                Expenses = previousExpenses,
                Savings = previousSavings
            },
            Changes = new ChangeMetrics
            {
                IncomeChange = incomeChange,
                IncomeChangePercentage = previousIncome > 0
                    ? Math.Round((incomeChange / previousIncome) * 100, 2)
                    : 0,
                ExpensesChange = expensesChange,
                ExpensesChangePercentage = previousExpenses > 0
                    ? Math.Round((expensesChange / previousExpenses) * 100, 2)
                    : 0,
                SavingsChange = savingsChange,
                SavingsChangePercentage = previousSavings > 0
                    ? Math.Round((savingsChange / previousSavings) * 100, 2)
                    : (previousSavings == 0 && savingsChange > 0 ? 100 : 0)
            }
        };
    }

    /// <summary>
    /// Get cashflow summary for a full year
    /// </summary>
    public async Task<CashflowResponse> GetCashflowAsync(Guid userId, int year)
    {
        if (year < 2000 || year > DateTime.UtcNow.Year + 1)
        {
            throw new ArgumentException("Invalid year");
        }

        var startDate = new DateTime(year, 1, 1);
        var endDate = new DateTime(year, 12, 31);

        // Get all transactions and filter for the year
        var allTransactions = await _unitOfWork.Transactions.GetAllAsync();

        var transactions = allTransactions
            .Where(t => t.UserId == userId
                && t.Date >= startDate
                && t.Date <= endDate
                && t.Status == TransactionStatus.Completed)
            .ToList();

        var monthlyData = new List<MonthlyCashflow>();
        decimal cumulativeCashflow = 0;

        // Process each month
        for (int month = 1; month <= 12; month++)
        {
            var monthStart = new DateTime(year, month, 1);
            var monthEnd = monthStart.AddMonths(1).AddDays(-1);

            var monthTransactions = transactions
                .Where(t => t.Date >= monthStart && t.Date <= monthEnd)
                .ToList();

            var income = monthTransactions
                .Where(t => t.Type == TransactionType.Income)
                .Sum(t => t.AmountInBaseCurrency);

            var expenses = monthTransactions
                .Where(t => t.Type == TransactionType.Expense)
                .Sum(t => t.AmountInBaseCurrency);

            var netCashflow = income - expenses;
            cumulativeCashflow += netCashflow;

            monthlyData.Add(new MonthlyCashflow
            {
                Month = monthStart.ToString("yyyy-MM"),
                Income = income,
                Expenses = expenses,
                NetCashflow = netCashflow,
                CumulativeCashflow = cumulativeCashflow
            });
        }

        return new CashflowResponse
        {
            Year = year,
            Months = monthlyData,
            TotalIncome = monthlyData.Sum(m => m.Income),
            TotalExpenses = monthlyData.Sum(m => m.Expenses),
            TotalNetCashflow = monthlyData.Sum(m => m.NetCashflow)
        };
    }

    /// <summary>
    /// Get top expenses for a date range
    /// </summary>
    public async Task<TopExpensesResponse> GetTopExpensesAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate,
        int limit = 10)
    {
        // Validate parameters
        if (startDate > endDate)
        {
            throw new ArgumentException("Start date cannot be after end date");
        }
        if (limit <= 0 || limit > 100)
        {
            throw new ArgumentException("Limit must be between 1 and 100");
        }

        // Get all transactions and filter
        var allTransactions = await _unitOfWork.Transactions.GetAllAsync();

        var transactions = allTransactions
            .Where(t => t.UserId == userId
                && t.Type == TransactionType.Expense
                && t.Date >= startDate
                && t.Date <= endDate
                && t.Status == TransactionStatus.Completed)
            .ToList();

        var topExpenses = transactions
            .OrderByDescending(t => t.AmountInBaseCurrency)
            .Take(limit)
            .Select(t => new ExpenseDetail
            {
                TransactionId = t.Id,
                Date = t.Date,
                Description = t.Description,
                Amount = t.AmountInBaseCurrency,
                CategoryName = t.Category?.Name ?? "Uncategorized",
                AccountName = t.Account?.Name ?? "Unknown Account"
            })
            .ToList();

        return new TopExpensesResponse
        {
            Period = new PeriodInfo
            {
                StartDate = startDate,
                EndDate = endDate
            },
            TopExpenses = topExpenses,
            TotalAmount = topExpenses.Sum(e => e.Amount)
        };
    }
}
