using Estoque.Domain.Common;
using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class ProductRepository(AppDbContext db) : IProductRepository
{
    private const int MaxPageSize = 100;

    private IQueryable<Product> Active => db.Products.Where(p => p.ArchivedAt == null);

    public Task<Product?> GetByIdAsync(int id, CancellationToken ct = default) =>
        Active.Include(p => p.Stock).Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<bool> CodeExistsAsync(string code, CancellationToken ct = default) =>
        db.Products.AnyAsync(p => p.Code == code, ct);

    public async Task<PagedResult<Product>> ListAsync(ProductFilter filter, CancellationToken ct = default)
    {
        var query = Active.AsNoTracking().Include(p => p.Stock).Include(p => p.Category).AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var term = $"%{filter.Search.Trim()}%";
            query = query.Where(p => EF.Functions.ILike(p.Name, term) || EF.Functions.ILike(p.Code, term));
        }

        if (filter.CategoryId is { } categoryId)
            query = query.Where(p => p.CategoryId == categoryId);

        if (filter.OnlyBelowMinimumStock)
            query = query.Where(p => p.Stock.TotalQuantity - p.Stock.ReservedQuantity < p.MinimumStock);

        var page = Math.Max(filter.Page, 1);
        var pageSize = Math.Clamp(filter.PageSize, 1, MaxPageSize);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Product>(items, page, pageSize, total);
    }

    public void Add(Product product) => db.Products.Add(product);
}