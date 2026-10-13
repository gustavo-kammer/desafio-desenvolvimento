using System.ComponentModel.DataAnnotations;
using Estoque.Domain.Enums;

namespace Estoque.Application.Users;

public sealed record CreateUserRequest(
    [Required, StringLength(120, MinimumLength = 1)] string Name,
    [Required, EmailAddress, StringLength(160)] string Email,
    [Required, StringLength(72)] string Password,
    UserRole Role);

public sealed record UpdateUserRequest(
    [Required, StringLength(120, MinimumLength = 1)] string Name,
    [Required, EmailAddress, StringLength(160)] string Email,
    UserRole Role);

public sealed record ResetPasswordRequest(
    [Required, StringLength(72)] string NewPassword);