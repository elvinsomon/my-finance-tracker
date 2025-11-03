using System.ComponentModel.DataAnnotations;
using FinanceManager.Core.Enums;

namespace FinanceManager.API.DTOs.Requests;

public class CategoryRuleRequest
{
    [Required(ErrorMessage = "Rule name is required")]
    [StringLength(100, ErrorMessage = "Rule name cannot exceed 100 characters")]
    public string RuleName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category ID is required")]
    public Guid CategoryId { get; set; }

    [Required(ErrorMessage = "Match type is required")]
    public RuleMatchType MatchType { get; set; }

    [Required(ErrorMessage = "Pattern is required")]
    [StringLength(200, ErrorMessage = "Pattern cannot exceed 200 characters")]
    public string Pattern { get; set; } = string.Empty;

    public bool IsCaseSensitive { get; set; } = false;

    [Range(1, 100, ErrorMessage = "Priority must be between 1 and 100")]
    public int Priority { get; set; } = 50;
}
