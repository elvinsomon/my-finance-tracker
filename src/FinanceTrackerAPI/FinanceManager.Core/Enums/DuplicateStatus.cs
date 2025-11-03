namespace FinanceManager.Core.Enums;

/// <summary>
/// Represents the duplicate detection status of an imported transaction
/// </summary>
public enum DuplicateStatus
{
    /// <summary>
    /// Transaction is new and does not match any existing transaction
    /// </summary>
    New = 0,

    /// <summary>
    /// Transaction appears to be a duplicate based on heuristics (date + amount or description similarity)
    /// </summary>
    LikelyDuplicate = 1,

    /// <summary>
    /// Transaction is confirmed as duplicate (exact match on reference number)
    /// </summary>
    ConfirmedDuplicate = 2
}
