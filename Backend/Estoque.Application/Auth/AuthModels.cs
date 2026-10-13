using System.ComponentModel.DataAnnotations;
using Estoque.Application.Users;

namespace Estoque.Application.Auth;

public sealed record LoginRequest(
    [Required] string Email,
    [Required] string Password);

public sealed record LoginResponse(string AccessToken, DateTime ExpiresAt, UserDto User);