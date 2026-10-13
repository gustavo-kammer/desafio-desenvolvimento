using Estoque.Application.Abstractions;
using Estoque.Application.Auth;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;
using NSubstitute;

namespace Estoque.Tests.Auth;

public class AuthServiceTests
{
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
    private readonly ITokenService _tokens = Substitute.For<ITokenService>();
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _tokens.Generate(Arg.Any<User>()).Returns(new AccessToken("jwt-token", DateTime.UtcNow.AddHours(1)));
        _sut = new AuthService(_users, _hasher, _tokens);
    }

    private User GivenUser(bool active = true)
    {
        var user = new User("Ana", "ana@empresa.com", "hash", UserRole.Operator);
        if (!active)
            user.Deactivate();

        _users.GetByEmailAsync("ana@empresa.com", Arg.Any<CancellationToken>()).Returns(user);
        return user;
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        GivenUser();
        _hasher.Verify("Senha@123", "hash").Returns(true);

        var response = await _sut.LoginAsync(new LoginRequest("  ANA@empresa.com ", "Senha@123"));

        Assert.Equal("jwt-token", response.AccessToken);
        Assert.Equal("ana@empresa.com", response.User.Email);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorized()
    {
        GivenUser();
        _hasher.Verify(Arg.Any<string>(), Arg.Any<string>()).Returns(false);

        await Assert.ThrowsAsync<UnauthorizedException>(
            () => _sut.LoginAsync(new LoginRequest("ana@empresa.com", "errada")));

        _tokens.DidNotReceive().Generate(Arg.Any<User>());
    }

    [Fact]
    public async Task LoginAsync_UnknownEmail_ThrowsUnauthorized()
    {
        _users.GetByEmailAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

        await Assert.ThrowsAsync<UnauthorizedException>(
            () => _sut.LoginAsync(new LoginRequest("ninguem@empresa.com", "Senha@123")));
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ThrowsEvenWithCorrectPassword()
    {
        GivenUser(active: false);
        _hasher.Verify(Arg.Any<string>(), Arg.Any<string>()).Returns(true);

        await Assert.ThrowsAsync<UnauthorizedException>(
            () => _sut.LoginAsync(new LoginRequest("ana@empresa.com", "Senha@123")));

        _tokens.DidNotReceive().Generate(Arg.Any<User>());
    }
}