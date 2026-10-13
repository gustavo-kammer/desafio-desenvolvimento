using Estoque.Domain.Entities;

namespace Estoque.Application.Abstractions;

public sealed record AccessToken(string Value, DateTime ExpiresAt);

public interface ITokenService
{
    AccessToken Generate(User user);
}