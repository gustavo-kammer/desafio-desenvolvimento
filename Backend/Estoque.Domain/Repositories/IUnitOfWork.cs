namespace Estoque.Domain.Repositories;

public interface IUnitOfWork
{
    Task CommitAsync(CancellationToken ct = default);
}
