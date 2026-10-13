using Estoque.Domain.Common;
using Estoque.Domain.Entities;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class StockMovementRepository(AppDbContext db) : IStockMovementRepository
{
    private const int MaxPageSize = 100;

    public async Task<PagedResult<StockMovement>> ListAsync(StockMovementFilter filter, CancellationToken ct = default)
    {
        var query = db.StockMovements.AsNoTracking().AsQueryable();

        if (filter.ProductId is { } productId)
            query = query.Where(m => m.ProductId == productId);
        if (filter.UserId is { } userId)
            query = query.Where(m => m.UserId == userId);
        if (filter.Type is { } type)
            query = query.Where(m => m.Type == type);
        if (filter.From is { } from)
        {
            var fromUtc = ToUtc(from);
            query = query.Where(m => m.OccurredAt >= fromUtc);
        }
        if (filter.To is { } to)
        {
            var toUtc = ToUtc(to);
            query = query.Where(m => m.OccurredAt <= toUtc);
        }

        var page = Math.Max(filter.Page, 1);
        var pageSize = Math.Clamp(filter.PageSize, 1, MaxPageSize);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(m => m.OccurredAt)
            .ThenByDescending(m => m.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<StockMovement>(items, page, pageSize, total);
    }

    public void Add(StockMovement movement) => db.StockMovements.Add(movement);
    private static DateTime ToUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}