using Estoque.Domain.Enums;

namespace Estoque.Domain.Repositories;
public interface IAnalyticsRepository
{
    Task<StockOverview> GetOverviewAsync(CancellationToken ct = default);

    Task<IReadOnlyList<DailyMovementCount>> GetDailyMovementsAsync(
        DateTime fromUtc, DateTime toUtc, int utcOffsetMinutes, CancellationToken ct = default);

    Task<IReadOnlyList<MovementTypeCount>> GetMovementsByTypeAsync(
        DateTime fromUtc, DateTime toUtc, CancellationToken ct = default);

    Task<IReadOnlyList<ProductMovementCount>> GetTopMovedProductsAsync(
        DateTime fromUtc, DateTime toUtc, int take, CancellationToken ct = default);

    Task<IReadOnlyList<CriticalProduct>> GetCriticalProductsAsync(int take, CancellationToken ct = default);
}

public sealed record StockOverview(int ActiveProducts, int BelowMinimum, int ActiveReservations);

public sealed record DailyMovementCount(DateTime Day, int Entries, int Exits);

public sealed record MovementTypeCount(MovementType Type, int Count);

public sealed record ProductMovementCount(int ProductId, string Code, string Name, int Count);

public sealed record CriticalProduct(
    int ProductId, string Code, string Name, UnitOfMeasure Unit, decimal Available, decimal MinimumStock);
