using System.Globalization;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Analytics;

public sealed class AnalyticsService(IAnalyticsRepository analytics, TimeProvider clock) : IAnalyticsService
{
    private const int MinDays = 1;
    private const int MaxDays = 365;
    private const int MaxOffsetMinutes = 14 * 60;
    private const int TopProductsCount = 5;
    private const int CriticalProductsCount = 8;

    public async Task<AnalyticsSummaryDto> GetSummaryAsync(
        int days, int utcOffsetMinutes, CancellationToken ct = default)
    {
        days = Math.Clamp(days, MinDays, MaxDays);
        utcOffsetMinutes = Math.Clamp(utcOffsetMinutes, -MaxOffsetMinutes, MaxOffsetMinutes);

        var nowUtc = clock.GetUtcNow().UtcDateTime;
        var today = nowUtc.AddMinutes(utcOffsetMinutes).Date;
        var firstDay = today.AddDays(-(days - 1));
        var fromUtc = DateTime.SpecifyKind(firstDay.AddMinutes(-utcOffsetMinutes), DateTimeKind.Utc);

        var overview = await analytics.GetOverviewAsync(ct);
        var daily = await analytics.GetDailyMovementsAsync(fromUtc, nowUtc, utcOffsetMinutes, ct);
        var byType = await analytics.GetMovementsByTypeAsync(fromUtc, nowUtc, ct);
        var top = await analytics.GetTopMovedProductsAsync(fromUtc, nowUtc, TopProductsCount, ct);
        var critical = await analytics.GetCriticalProductsAsync(CriticalProductsCount, ct);

        var byDay = daily.ToDictionary(d => d.Day.Date);
        var series = Enumerable.Range(0, days)
            .Select(offset => firstDay.AddDays(offset))
            .Select(day => byDay.TryGetValue(day, out var found)
                ? new DailyMovementDto(Format(day), found.Entries, found.Exits)
                : new DailyMovementDto(Format(day), 0, 0))
            .ToList();

        return new AnalyticsSummaryDto(
            days,
            new AnalyticsOverviewDto(
                overview.ActiveProducts,
                overview.BelowMinimum,
                overview.ActiveReservations,
                byType.Sum(t => t.Count)),
            series,
            byType.Select(t => new MovementTypeCountDto(t.Type, t.Count)).ToList(),
            top.Select(p => new TopProductDto(p.ProductId, p.Code, p.Name, p.Count)).ToList(),
            critical.Select(p => new CriticalProductDto(
                p.ProductId, p.Code, p.Name, p.Unit, p.Available, p.MinimumStock,
                p.MinimumStock > 0 ? Math.Round(p.Available / p.MinimumStock, 2) : 0m)).ToList());
    }

    private static string Format(DateTime day) => day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
