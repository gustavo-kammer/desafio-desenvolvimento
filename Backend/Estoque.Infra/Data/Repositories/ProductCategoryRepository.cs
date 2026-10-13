using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class ProductCategoryRepository(AppDbContext db) : IProductCategoryRepository
{
    public Task<ProductCategory?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.ProductCategories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<ProductCategory>> ListAsync(CancellationToken ct = default) =>
        await db.ProductCategories.AsNoTracking().OrderBy(c => c.Id).ToListAsync(ct);

    public Task<bool> NameExistsAsync(string name, int? excludeId, CancellationToken ct = default)
    {
        var normalized = name.Trim().ToLower();
        return db.ProductCategories.AnyAsync(
            c => c.Name.ToLower() == normalized && (excludeId == null || c.Id != excludeId), ct);
    }

    public void Add(ProductCategory category) => db.ProductCategories.Add(category);
}