using Estoque.Domain.Enums;

namespace Estoque.Application.Users;

public sealed record CreateUserRequest(string Name, string Email, string Password, UserRole Role);

public sealed record UpdateUserRequest(string Name, string Email, UserRole Role);