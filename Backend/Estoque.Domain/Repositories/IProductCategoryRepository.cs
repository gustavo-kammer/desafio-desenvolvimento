using Estoque.Domain.Entities;

namespace Estoque.Domain.Repositories;

public interface IProductCategoryRepository
{
    Task<ProductCategory?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<ProductCategory>> ListAsync(CancellationToken ct = default);
}
