using System.ComponentModel.DataAnnotations;

namespace FinanceManager.API.DTOs.Requests;

public class UploadCsvRequest
{
    [Required(ErrorMessage = "File is required")]
    public IFormFile File { get; set; } = null!;

    [Required(ErrorMessage = "Financial account is required")]
    public Guid FinancialAccountId { get; set; }

    [Required(ErrorMessage = "Currency is required")]
    [StringLength(3, MinimumLength = 3, ErrorMessage = "Currency must be a 3-letter code (e.g., DOP, USD, EUR)")]
    public string Currency { get; set; } = string.Empty;
}
