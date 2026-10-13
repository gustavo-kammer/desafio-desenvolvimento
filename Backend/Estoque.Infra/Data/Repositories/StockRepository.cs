using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class StockRepository(AppDbContext db) : IStockRepository
{
    public Task<Stock?> GetByProductIdAsync(int productId, CancellationToken ct = default) =>
        db.Stocks.FirstOrDefaultAsync(s => s.ProductId == productId, ct);
}