using Estoque.Domain.Entities;

namespace Estoque.Domain.Repositories;

public interface IProductCategoryRepository
{
    Task<ProductCategory?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<IReadOnlyList<ProductCategory>> ListAsync(CancellationToken ct = default);
    Task<bool> NameExistsAsync(string name, int? excludeId, CancellationToken ct = default);
    void Add(ProductCategory category);
}
