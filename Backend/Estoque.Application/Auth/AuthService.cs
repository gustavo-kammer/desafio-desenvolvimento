using Estoque.Application.Abstractions;
using Estoque.Application.Users;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Auth;

public sealed class AuthService(
    IUserRepository users,
    IPasswordHasher passwordHasher,
    ITokenService tokenService) : IAuthService
{
    private const string InvalidCredentialsMessage = "E-mail ou senha inválidos.";

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await users.GetByEmailAsync(email, ct);

        if (user is null || !user.IsActive || !passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException(InvalidCredentialsMessage);

        var token = tokenService.Generate(user);
        return new LoginResponse(token.Value, token.ExpiresAt, UserDto.From(user));
    }
}
