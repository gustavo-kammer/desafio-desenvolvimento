namespace Estoque.Application.Users;

public interface IUserService
{
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default);
    Task<UserDto> UpdateAsync(int id, UpdateUserRequest request, CancellationToken ct = default);
    Task ResetPasswordAsync(int id, string newPassword, CancellationToken ct = default);
    Task<UserDto> SetActiveAsync(int id, bool active, CancellationToken ct = default);
    Task<UserDto> GetAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken ct = default);
}