using FinanceManager.Core.Enums;
using FinanceManager.Core.Entities;
using FinanceManager.API.DTOs.Responses;
using FinanceManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.API.Services;

/// <summary>
/// Service for detecting duplicate transactions during CSV import
/// </summary>
public class DuplicateDetectionService
{
    private readonly ApplicationDbContext _context;

    public DuplicateDetectionService(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Checks if an imported transaction is a duplicate using 3-stage detection algorithm
    /// </summary>
    /// <returns>Tuple with (duplicate status, existing transaction ID if duplicate, reason)</returns>
    public async Task<(DuplicateStatus status, Guid? existingId, string? reason)> CheckDuplicateAsync(
        ImportedTransactionDto transaction,
        Guid financialAccountId,
        Guid userId)
    {
        // Stage 1: Exact Reference Match (highest confidence)
        if (!string.IsNullOrWhiteSpace(transaction.ExternalReference))
        {
            var exactMatch = await _context.Transactions
                .Where(t => t.ExternalTransactionId == transaction.ExternalReference &&
                           t.AccountId == financialAccountId &&
                           t.UserId == userId)
                .FirstOrDefaultAsync();

            if (exactMatch != null)
            {
                return (DuplicateStatus.ConfirmedDuplicate, exactMatch.Id,
                    $"Exact match on reference number: {transaction.ExternalReference}");
            }
        }

        // Stage 2: Date + Amount Match (±2 days window)
        var dateFrom = transaction.Date.AddDays(-2);
        var dateTo = transaction.Date.AddDays(2);
        var absoluteAmount = Math.Abs(transaction.Amount);

        var dateAmountMatch = await _context.Transactions
            .Where(t => t.Date >= dateFrom &&
                       t.Date <= dateTo &&
                       t.Amount == absoluteAmount &&
                       t.AccountId == financialAccountId &&
                       t.UserId == userId)
            .FirstOrDefaultAsync();

        if (dateAmountMatch != null)
        {
            var daysDiff = Math.Abs((dateAmountMatch.Date - transaction.Date).Days);
            return (DuplicateStatus.LikelyDuplicate, dateAmountMatch.Id,
                $"Same amount ({transaction.Currency} {absoluteAmount:N2}) on similar date (±{daysDiff} days)");
        }

        // Stage 3: Fuzzy Description Match (±3 days window, similar amount and description)
        var dateFrom3 = transaction.Date.AddDays(-3);
        var dateTo3 = transaction.Date.AddDays(3);

        var candidates = await _context.Transactions
            .Where(t => t.Date >= dateFrom3 &&
                       t.Date <= dateTo3 &&
                       Math.Abs(t.Amount - absoluteAmount) < 0.01m &&
                       t.AccountId == financialAccountId &&
                       t.UserId == userId)
            .Select(t => new { t.Id, t.Description, t.Date })
            .ToListAsync();

        foreach (var candidate in candidates)
        {
            var similarity = CalculateLevenshteinSimilarity(
                transaction.Description,
                candidate.Description);

            if (similarity > 0.80m)
            {
                return (DuplicateStatus.LikelyDuplicate, candidate.Id,
                    $"Similar description ({similarity:P0} match) and amount on similar date");
            }
        }

        // No duplicate detected
        return (DuplicateStatus.New, null, null);
    }

    /// <summary>
    /// Calculates similarity between two strings using Levenshtein distance
    /// </summary>
    /// <returns>Similarity score from 0.0 (completely different) to 1.0 (identical)</returns>
    private decimal CalculateLevenshteinSimilarity(string s1, string s2)
    {
        if (string.IsNullOrEmpty(s1) && string.IsNullOrEmpty(s2))
            return 1.0m;

        if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
            return 0.0m;

        // Normalize strings for comparison
        s1 = s1.Trim().ToLowerInvariant();
        s2 = s2.Trim().ToLowerInvariant();

        if (s1 == s2)
            return 1.0m;

        var distance = ComputeLevenshteinDistance(s1, s2);
        var maxLength = Math.Max(s1.Length, s2.Length);

        return 1.0m - ((decimal)distance / maxLength);
    }

    /// <summary>
    /// Computes the Levenshtein distance between two strings
    /// </summary>
    private int ComputeLevenshteinDistance(string s1, string s2)
    {
        var matrix = new int[s1.Length + 1, s2.Length + 1];

        // Initialize first column and row
        for (int i = 0; i <= s1.Length; i++)
            matrix[i, 0] = i;

        for (int j = 0; j <= s2.Length; j++)
            matrix[0, j] = j;

        // Fill matrix
        for (int i = 1; i <= s1.Length; i++)
        {
            for (int j = 1; j <= s2.Length; j++)
            {
                var cost = (s1[i - 1] == s2[j - 1]) ? 0 : 1;

                matrix[i, j] = Math.Min(
                    Math.Min(
                        matrix[i - 1, j] + 1,      // deletion
                        matrix[i, j - 1] + 1),     // insertion
                    matrix[i - 1, j - 1] + cost);  // substitution
            }
        }

        return matrix[s1.Length, s2.Length];
    }
}
