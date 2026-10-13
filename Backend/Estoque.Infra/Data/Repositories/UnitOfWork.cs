using Estoque.Domain.Repositories;

namespace Estoque.Infra.Data.Repositories;

internal sealed class UnitOfWork(AppDbContext db) : IUnitOfWork
{
    public Task CommitAsync(CancellationToken ct = default) => db.SaveChangesAsync(ct);
}