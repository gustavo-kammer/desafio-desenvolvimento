using Estoque.Application.Abstractions;
using Estoque.Application.Users;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;
using NSubstitute;

namespace Estoque.Tests.Users;

public class UserServiceTests
{
    private readonly IUserRepository _users = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher _hasher = Substitute.For<IPasswordHasher>();
    private readonly ICurrentUser _currentUser = Substitute.For<ICurrentUser>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _currentUser.Id.Returns(5);
        _hasher.Hash(Arg.Any<string>()).Returns("hashed");
        _sut = new UserService(_users, _hasher, _currentUser, _unitOfWork);
    }

    [Fact]
    public async Task CreateAsync_HashesPasswordAndLowercasesEmail()
    {
        User? added = null;
        _users.When(u => u.Add(Arg.Any<User>())).Do(c => added = c.Arg<User>());

        var dto = await _sut.CreateAsync(
            new CreateUserRequest("Ana", " Ana@Empresa.com ", "Senha@123", UserRole.Operator));

        Assert.Equal("ana@empresa.com", dto.Email);
        Assert.Equal("hashed", added!.PasswordHash);
        await _unitOfWork.Received(1).CommitAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmail_ThrowsConflict()
    {
        _users.EmailExistsAsync("ana@empresa.com", Arg.Any<CancellationToken>()).Returns(true);

        await Assert.ThrowsAsync<ConflictException>(() => _sut.CreateAsync(
            new CreateUserRequest("Ana", "ana@empresa.com", "Senha@123", UserRole.Operator)));

        _users.DidNotReceive().Add(Arg.Any<User>());
    }

    [Fact]
    public async Task CreateAsync_WeakPassword_Throws()
    {
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => _sut.CreateAsync(
            new CreateUserRequest("Ana", "ana@empresa.com", "123", UserRole.Operator)));

        Assert.Equal(ErrorCodes.WeakPassword, ex.ErrorCode);
    }

    [Fact]
    public async Task SetActiveAsync_DeactivatingYourself_Throws()
    {
        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => _sut.SetActiveAsync(5, active: false));

        Assert.Equal(ErrorCodes.CannotChangeOwnAccess, ex.ErrorCode);
        await _unitOfWork.DidNotReceive().CommitAsync(Arg.Any<CancellationToken>());
    }
}