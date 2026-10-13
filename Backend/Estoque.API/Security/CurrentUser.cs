using System.Security.Claims;
using Estoque.Application.Abstractions;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;

namespace Estoque.API.Security;

internal sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private ClaimsPrincipal Principal => accessor.HttpContext?.User
        ?? throw new UnauthorizedException("Usuário não autenticado.");

    public int Id => int.TryParse(Principal.FindFirstValue("sub"), out var id)
        ? id
        : throw new UnauthorizedException("Usuário não autenticado.");

    public UserRole Role => Enum.TryParse<UserRole>(Principal.FindFirstValue("role"), out var role)
        ? role
        : throw new UnauthorizedException("Usuário não autenticado.");
}