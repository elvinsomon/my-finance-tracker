using System.Text.RegularExpressions;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Enums;
using FinanceManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FinanceManager.API.Services;

/// <summary>
/// Engine for applying category rules to transaction descriptions
/// </summary>
public class CategoryRuleEngine
{
    private readonly ApplicationDbContext _context;

    public CategoryRuleEngine(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Suggests a category for a transaction based on active rules
    /// </summary>
    /// <returns>Tuple with (categoryId, categoryName, confidence, ruleName)</returns>
    public async Task<(Guid? categoryId, string? categoryName, decimal confidence, string? ruleName)>
        SuggestCategoryAsync(string description, Guid userId)
    {
        if (string.IsNullOrWhiteSpace(description))
            return (null, null, 0, null);

        // System user ID for predefined rules (shared across all users)
        var systemUserId = Guid.Parse("b47b33b5-11d0-4d55-a012-be51caa42a6f");

        // Load active rules sorted by priority (highest first)
        // Include both user's custom rules AND system predefined rules
        var rules = await _context.CategoryRules
            .Where(r => (r.UserId == userId || r.UserId == systemUserId) && r.IsActive)
            .Include(r => r.Category)
            .OrderByDescending(r => r.Priority)
            .ThenBy(r => r.UserId == userId ? 0 : 1) // User's rules have higher precedence than system rules at same priority
            .ToListAsync();

        if (!rules.Any())
            return (null, null, 0, null);

        // Evaluate each rule in priority order
        foreach (var rule in rules)
        {
            if (EvaluateRule(rule, description))
            {
                // Calculate confidence score
                decimal confidence = CalculateConfidence(rule, description);

                // Increment match count
                rule.MatchCount++;
                rule.LastMatchedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return (rule.CategoryId, rule.Category.Name, confidence, rule.RuleName);
            }
        }

        // No match found
        return (null, null, 0, null);
    }

    /// <summary>
    /// Evaluates if a rule matches the description
    /// </summary>
    private bool EvaluateRule(CategoryRule rule, string description)
    {
        try
        {
            var comparison = rule.IsCaseSensitive
                ? StringComparison.Ordinal
                : StringComparison.OrdinalIgnoreCase;

            // Handle pipe-separated patterns (OR logic) for all match types
            if (rule.Pattern.Contains('|'))
            {
                var patterns = rule.Pattern.Split('|', StringSplitOptions.RemoveEmptyEntries);
                foreach (var pattern in patterns)
                {
                    var trimmedPattern = pattern.Trim();
                    var matches = rule.MatchType switch
                    {
                        RuleMatchType.Contains => description.Contains(trimmedPattern, comparison),
                        RuleMatchType.StartsWith => description.StartsWith(trimmedPattern, comparison),
                        RuleMatchType.EndsWith => description.EndsWith(trimmedPattern, comparison),
                        RuleMatchType.Exact => description.Equals(trimmedPattern, comparison),
                        RuleMatchType.Regex => EvaluateRegexRule(trimmedPattern, description, rule.IsCaseSensitive),
                        _ => false
                    };

                    if (matches)
                        return true;
                }
                return false;
            }

            // Single pattern evaluation
            return rule.MatchType switch
            {
                RuleMatchType.Contains => description.Contains(rule.Pattern, comparison),
                RuleMatchType.StartsWith => description.StartsWith(rule.Pattern, comparison),
                RuleMatchType.EndsWith => description.EndsWith(rule.Pattern, comparison),
                RuleMatchType.Exact => description.Equals(rule.Pattern, comparison),
                RuleMatchType.Regex => EvaluateRegexRule(rule.Pattern, description, rule.IsCaseSensitive),
                _ => false
            };
        }
        catch (Exception)
        {
            // If regex is invalid or other error, return false
            return false;
        }
    }

    /// <summary>
    /// Evaluates regex pattern (handles pipe-separated patterns)
    /// </summary>
    private bool EvaluateRegexRule(string pattern, string description, bool caseSensitive)
    {
        try
        {
            var options = caseSensitive ? RegexOptions.None : RegexOptions.IgnoreCase;

            // Handle pipe-separated patterns (OR logic)
            if (pattern.Contains('|'))
            {
                var patterns = pattern.Split('|', StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in patterns)
                {
                    if (Regex.IsMatch(description, p.Trim(), options))
                        return true;
                }
                return false;
            }

            return Regex.IsMatch(description, pattern, options);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Calculates confidence score for a matched rule
    /// </summary>
    private decimal CalculateConfidence(CategoryRule rule, string description)
    {
        decimal confidence = 0.70m; // Base score

        // Bonus for exact match
        if (rule.MatchType == RuleMatchType.Exact)
            confidence += 0.10m;

        // Bonus for high match count (proven rule)
        if (rule.MatchCount > 50)
            confidence += 0.05m;

        // Bonus for high priority
        if (rule.Priority > 80)
            confidence += 0.05m;

        // Bonus for multiple pattern occurrences
        var occurrences = CountPatternOccurrences(rule.Pattern, description, rule.IsCaseSensitive);
        if (occurrences > 1)
            confidence += 0.10m;

        // Cap at 1.00
        return Math.Min(confidence, 1.00m);
    }

    /// <summary>
    /// Counts how many times a pattern appears in text
    /// </summary>
    private int CountPatternOccurrences(string pattern, string text, bool caseSensitive)
    {
        try
        {
            var comparison = caseSensitive
                ? StringComparison.Ordinal
                : StringComparison.OrdinalIgnoreCase;

            // Handle pipe-separated patterns
            if (pattern.Contains('|'))
            {
                var patterns = pattern.Split('|', StringSplitOptions.RemoveEmptyEntries);
                return patterns.Count(p => text.Contains(p.Trim(), comparison));
            }

            // Count occurrences of single pattern
            int count = 0;
            int index = 0;
            while ((index = text.IndexOf(pattern, index, comparison)) != -1)
            {
                count++;
                index += pattern.Length;
            }
            return count;
        }
        catch
        {
            return 0;
        }
    }
}
