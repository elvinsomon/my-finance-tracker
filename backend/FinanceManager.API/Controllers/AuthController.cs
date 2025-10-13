using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using FinanceManager.Core.Entities;
using FinanceManager.Core.Exceptions;
using FinanceManager.Core.Interfaces.Repositories;
using FinanceManager.Core.Validators;
using FinanceManager.API.DTOs.Responses;
using FinanceManager.API.Services;

namespace FinanceManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly JwtService _jwtService;
    private readonly RegisterUserValidator _registerValidator;
    private readonly LoginValidator _loginValidator;

    public AuthController(
        IUnitOfWork unitOfWork,
        JwtService jwtService,
        RegisterUserValidator registerValidator,
        LoginValidator loginValidator)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterUserRequest request)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.Select(e => e.ErrorMessage).ToList());
        }

        if (await _unitOfWork.Users.EmailExistsAsync(request.Email))
        {
            throw new ValidationException("Email already exists");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            DefaultCurrency = request.DefaultCurrency,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user.Id, user.Email);
        var expiresAt = _jwtService.GetTokenExpiration();

        return StatusCode(201, new AuthResponse
        {
            Token = token,
            User = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                DefaultCurrency = user.DefaultCurrency
            },
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors.Select(e => e.ErrorMessage).ToList());
        }

        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        var token = _jwtService.GenerateToken(user.Id, user.Email);
        var expiresAt = _jwtService.GetTokenExpiration();

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                DefaultCurrency = user.DefaultCurrency
            },
            ExpiresAt = expiresAt
        });
    }
}
