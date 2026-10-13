using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Users;

public sealed record UserDto(int Id, string Name, string Email, UserRole Role, bool IsActive, DateTime CreatedAt)
{
    public static UserDto From(User u) => new(u.Id, u.Name, u.Email, u.Role, u.IsActive, u.CreatedAt);
}