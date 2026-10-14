using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class AnalyticsRepository(AppDbContext db) : IAnalyticsRepository
{
    public async Task<StockOverview> GetOverviewAsync(CancellationToken ct = default)
    {
        var activeProducts = await db.Products
            .AsNoTracking()
            .CountAsync(p => p.ArchivedAt == null, ct);

        var belowMinimum = await db.Products
            .AsNoTracking()
            .CountAsync(p => p.ArchivedAt == null
                && p.Stock.TotalQuantity - p.Stock.ReservedQuantity < p.MinimumStock, ct);

        var activeReservations = await db.Reservations
            .AsNoTracking()
            .CountAsync(r => r.Status == ReservationStatus.Active, ct);

        return new StockOverview(activeProducts, belowMinimum, activeReservations);
    }

    public async Task<IReadOnlyList<DailyMovementCount>> GetDailyMovementsAsync(
        DateTime fromUtc, DateTime toUtc, int utcOffsetMinutes, CancellationToken ct = default)
    {
        double offset = utcOffsetMinutes;

        var rows = await db.StockMovements
            .AsNoTracking()
            .Where(m => m.OccurredAt >= fromUtc && m.OccurredAt <= toUtc)
            .GroupBy(m => m.OccurredAt.AddMinutes(offset).Date)
            .Select(g => new
            {
                Day = g.Key,
                Entries = g.Count(m => m.Type == MovementType.Entry || m.Type == MovementType.AdjustmentIn),
                Exits = g.Count(m => m.Type == MovementType.Exit || m.Type == MovementType.AdjustmentOut)
            })
            .OrderBy(r => r.Day)
            .ToListAsync(ct);

        return rows.Select(r => new DailyMovementCount(r.Day, r.Entries, r.Exits)).ToList();
    }

    public async Task<IReadOnlyList<MovementTypeCount>> GetMovementsByTypeAsync(
        DateTime fromUtc, DateTime toUtc, CancellationToken ct = default)
    {
        var rows = await db.StockMovements
            .AsNoTracking()
            .Where(m => m.OccurredAt >= fromUtc && m.OccurredAt <= toUtc)
            .GroupBy(m => m.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        return rows.Select(r => new MovementTypeCount(r.Type, r.Count)).ToList();
    }

    public async Task<IReadOnlyList<ProductMovementCount>> GetTopMovedProductsAsync(
        DateTime fromUtc, DateTime toUtc, int take, CancellationToken ct = default)
    {
        var rows = await db.StockMovements
            .AsNoTracking()
            .Where(m => m.OccurredAt >= fromUtc && m.OccurredAt <= toUtc)
            .GroupBy(m => new { m.ProductId, m.Product.Code, m.Product.Name })
            .Select(g => new { g.Key.ProductId, g.Key.Code, g.Key.Name, Count = g.Count() })
            .OrderByDescending(r => r.Count)
            .ThenBy(r => r.Name)
            .Take(take)
            .ToListAsync(ct);

        return rows.Select(r => new ProductMovementCount(r.ProductId, r.Code, r.Name, r.Count)).ToList();
    }

    public async Task<IReadOnlyList<CriticalProduct>> GetCriticalProductsAsync(
        int take, CancellationToken ct = default)
    {
        var rows = await db.Products
            .AsNoTracking()
            .Where(p => p.ArchivedAt == null && p.MinimumStock > 0)
            .OrderBy(p => (p.Stock.TotalQuantity - p.Stock.ReservedQuantity) / p.MinimumStock)
            .ThenBy(p => p.Name)
            .Take(take)
            .Select(p => new
            {
                p.Id,
                p.Code,
                p.Name,
                p.Unit,
                Available = p.Stock.TotalQuantity - p.Stock.ReservedQuantity,
                p.MinimumStock
            })
            .ToListAsync(ct);

        return rows
            .Select(r => new CriticalProduct(r.Id, r.Code, r.Name, r.Unit, r.Available, r.MinimumStock))
            .ToList();
    }
}
