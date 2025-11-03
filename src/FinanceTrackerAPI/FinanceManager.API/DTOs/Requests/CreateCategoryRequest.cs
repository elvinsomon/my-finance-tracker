namespace FinanceManager.API.DTOs.Requests;

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
}
