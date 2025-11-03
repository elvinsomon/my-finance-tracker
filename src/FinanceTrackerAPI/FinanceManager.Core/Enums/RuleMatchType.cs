namespace FinanceManager.Core.Enums;

/// <summary>
/// Defines how a category rule pattern should be matched against transaction descriptions
/// </summary>
public enum RuleMatchType
{
    /// <summary>
    /// Pattern must appear anywhere in the description
    /// </summary>
    Contains = 0,

    /// <summary>
    /// Description must start with the pattern
    /// </summary>
    StartsWith = 1,

    /// <summary>
    /// Description must end with the pattern
    /// </summary>
    EndsWith = 2,

    /// <summary>
    /// Description must exactly match the pattern
    /// </summary>
    Exact = 3,

    /// <summary>
    /// Pattern is treated as a regular expression
    /// </summary>
    Regex = 4
}
