using Estoque.Domain.Entities;

namespace Estoque.Domain.Repositories;

public interface IStockRepository
{
    Task<Stock?> GetByProductIdAsync(int productId, CancellationToken ct = default);

}
