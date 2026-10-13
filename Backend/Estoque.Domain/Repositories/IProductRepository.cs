using Estoque.Domain.Common;
using Estoque.Domain.Entities;

namespace Estoque.Domain.Repositories;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> CodeExistsAsync(string code, CancellationToken ct = default);
    Task<PagedResult<Product>> ListAsync(ProductFilter filter, CancellationToken ct = default);
    void Add(Product product);
}

public sealed record ProductFilter(
    string? Search = null,
    int? CategoryId = null,
    bool OnlyBelowMinimumStock = false,
    int Page = 1,
    int PageSize = 20);