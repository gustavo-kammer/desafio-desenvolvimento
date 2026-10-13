using Estoque.Domain.Enums;

namespace Estoque.Application.Abstractions;

public interface ICurrentUser
{
    int Id { get; }
    UserRole Role { get; }
}
