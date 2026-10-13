using Estoque.Domain.Common;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Products;

public interface IProductService
{
    Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateAsync(int id, UpdateProductRequest request, CancellationToken ct = default);
    Task ArchiveAsync(int id, CancellationToken ct = default);
    Task<ProductDto> GetAsync(int id, CancellationToken ct = default);
    Task<PagedResult<ProductDto>> ListAsync(ProductFilter filter, CancellationToken ct = default);
    Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken ct = default);
}