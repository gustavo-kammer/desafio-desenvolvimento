using Estoque.Application.Abstractions;
using Estoque.Domain.Entities;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Users;

public sealed class UserService(
    IUserRepository users,
    IPasswordHasher passwordHasher,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork) : IUserService
{
    private const int MinimumPasswordLength = 8;

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
    {
        EnsurePasswordIsStrong(request.Password);

        var email = NormalizeEmail(request.Email);
        if (await users.EmailExistsAsync(email, ct))
            throw new ConflictException($"Já existe um usuário com o e-mail '{email}'.");

        var user = new User(request.Name, email, passwordHasher.Hash(request.Password), request.Role);
        users.Add(user);
        await unitOfWork.CommitAsync(ct);

        return UserDto.From(user);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken ct = default)
    {
        var user = await GetOrThrowAsync(id, ct);

        if (id == currentUser.Id && request.Role != user.Role)
            throw new BusinessRuleException(
                "Você não pode alterar o seu próprio perfil de acesso.", ErrorCodes.CannotChangeOwnAccess);

        var email = NormalizeEmail(request.Email);
        if (email != user.Email && await users.EmailExistsAsync(email, ct))
            throw new ConflictException($"Já existe um usuário com o e-mail '{email}'.");

        user.Update(request.Name, email, request.Role);
        await unitOfWork.CommitAsync(ct);

        return UserDto.From(user);
    }

    public async Task ResetPasswordAsync(int id, string newPassword, CancellationToken ct = default)
    {
        EnsurePasswordIsStrong(newPassword);

        var user = await GetOrThrowAsync(id, ct);
        user.ChangePasswordHash(passwordHasher.Hash(newPassword));
        await unitOfWork.CommitAsync(ct);
    }

    public async Task<UserDto> SetActiveAsync(int id, bool active, CancellationToken ct = default)
    {
        if (!active && id == currentUser.Id)
            throw new BusinessRuleException(
                "Você não pode desativar o seu próprio usuário.", ErrorCodes.CannotChangeOwnAccess);

        var user = await GetOrThrowAsync(id, ct);
        if (active) user.Activate(); else user.Deactivate();
        await unitOfWork.CommitAsync(ct);

        return UserDto.From(user);
    }

    public async Task<UserDto> GetAsync(int id, CancellationToken ct = default) =>
        UserDto.From(await GetOrThrowAsync(id, ct));

    public async Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken ct = default)
    {
        var list = await users.ListAsync(ct);
        return list.Select(UserDto.From).ToList();
    }

    private async Task<User> GetOrThrowAsync(int id, CancellationToken ct) =>
        await users.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Usuário {id} não encontrado.");

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static void EnsurePasswordIsStrong(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < MinimumPasswordLength)
            throw new BusinessRuleException(
                $"A senha deve ter no mínimo {MinimumPasswordLength} caracteres.", ErrorCodes.WeakPassword);
    }
}