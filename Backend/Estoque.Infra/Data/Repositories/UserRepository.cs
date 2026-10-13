using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default) =>
        db.Users.AnyAsync(u => u.Email == email, ct);

    public async Task<IReadOnlyList<User>> ListAsync(CancellationToken ct = default) =>
        await db.Users.AsNoTracking().OrderBy(u => u.Name).ToListAsync(ct);

    public void Add(User user) => db.Users.Add(user);
}