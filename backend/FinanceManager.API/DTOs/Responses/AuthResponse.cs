namespace FinanceManager.API.DTOs.Responses;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserResponse User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}

public class UserResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string DefaultCurrency { get; set; } = string.Empty;
}
