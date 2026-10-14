using Estoque.Domain.Enums;

namespace Estoque.Application.Analytics;

public sealed record AnalyticsSummaryDto(
    int Days,
    AnalyticsOverviewDto Overview,
    IReadOnlyList<DailyMovementDto> DailyMovements,
    IReadOnlyList<MovementTypeCountDto> MovementsByType,
    IReadOnlyList<TopProductDto> TopProducts,
    IReadOnlyList<CriticalProductDto> CriticalProducts);

public sealed record AnalyticsOverviewDto(
    int ActiveProducts, int BelowMinimum, int ActiveReservations, int MovementsInPeriod);

public sealed record DailyMovementDto(string Date, int Entries, int Exits);

public sealed record MovementTypeCountDto(MovementType Type, int Count);

public sealed record TopProductDto(int ProductId, string Code, string Name, int Movements);

public sealed record CriticalProductDto(
    int ProductId, string Code, string Name, UnitOfMeasure Unit,
    decimal Available, decimal MinimumStock, decimal Coverage);
