using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class ProductCategoryRepository(AppDbContext db) : IProductCategoryRepository
{
    public Task<ProductCategory?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.ProductCategories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<ProductCategory>> ListAsync(CancellationToken ct = default) =>
        await db.ProductCategories.AsNoTracking().OrderBy(c => c.Id).ToListAsync(ct);
}