namespace Estoque.Application.Analytics;

public interface IAnalyticsService
{
    Task<AnalyticsSummaryDto> GetSummaryAsync(int days, int utcOffsetMinutes, CancellationToken ct = default);
}
