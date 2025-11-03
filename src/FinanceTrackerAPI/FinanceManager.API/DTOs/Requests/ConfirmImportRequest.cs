using System.ComponentModel.DataAnnotations;

namespace FinanceManager.API.DTOs.Requests;

public class ConfirmImportRequest
{
    [Required]
    public Guid UploadId { get; set; }

    // Dictionary mapping row number to category ID
    public Dictionary<int, Guid> CategoryAssignments { get; set; } = new();
}
