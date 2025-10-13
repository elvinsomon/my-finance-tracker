namespace FinanceManager.API.DTOs.Responses;

public class CategoryResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public bool IsSystem { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsActive { get; set; }
    public List<CategoryResponse> Subcategories { get; set; } = new();
}
