using Estoque.Application.Users;

namespace Estoque.Application.Auth;

public sealed record LoginRequest(string Email, string Password);

public sealed record LoginResponse(string AccessToken, DateTime ExpiresAt, UserDto User);