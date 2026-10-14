using Estoque.Application.Analytics;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;
using NSubstitute;

namespace Estoque.Tests.Analytics;

public class AnalyticsServiceTests
{
    private readonly IAnalyticsRepository _repository = Substitute.For<IAnalyticsRepository>();

    private AnalyticsService CreateSut(DateTimeOffset now)
    {
        GivenEmptyRepository();
        return new AnalyticsService(_repository, new FixedTimeProvider(now));
    }

    private void GivenEmptyRepository()
    {
        _repository.GetOverviewAsync(Arg.Any<CancellationToken>()).Returns(new StockOverview(0, 0, 0));
        _repository.GetDailyMovementsAsync(default, default, default, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(Array.Empty<DailyMovementCount>());
        _repository.GetMovementsByTypeAsync(default, default, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(Array.Empty<MovementTypeCount>());
        _repository.GetTopMovedProductsAsync(default, default, default, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(Array.Empty<ProductMovementCount>());
        _repository.GetCriticalProductsAsync(default, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(Array.Empty<CriticalProduct>());
    }

    [Fact]
    public async Task GetSummaryAsync_FillsDaysWithoutMovementsWithZero()
    {
        var sut = CreateSut(new DateTimeOffset(2026, 10, 13, 15, 0, 0, TimeSpan.Zero));
        _repository.GetDailyMovementsAsync(default, default, default, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(new[] { new DailyMovementCount(new DateTime(2026, 10, 12), 3, 1) });

        var result = await sut.GetSummaryAsync(3, 0);

        Assert.Equal(new[] { "2026-10-11", "2026-10-12", "2026-10-13" }, result.DailyMovements.Select(d => d.Date));
        Assert.Equal(new[] { 0, 3, 0 }, result.DailyMovements.Select(d => d.Entries));
        Assert.Equal(new[] { 0, 1, 0 }, result.DailyMovements.Select(d => d.Exits));
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(-5, 1)]
    [InlineData(30, 30)]
    [InlineData(1000, 365)]
    public async Task GetSummaryAsync_ClampsTheNumberOfDays(int requested, int expected)
    {
        var sut = CreateSut(new DateTimeOffset(2026, 10, 13, 15, 0, 0, TimeSpan.Zero));

        var result = await sut.GetSummaryAsync(requested, 0);

        Assert.Equal(expected, result.Days);
        Assert.Equal(expected, result.DailyMovements.Count);
    }

    [Fact]
    public async Task GetSummaryAsync_UsesTheUsersTimeZoneToDecideToday()
    {
        var sut = CreateSut(new DateTimeOffset(2026, 10, 14, 1, 0, 0, TimeSpan.Zero));

        var result = await sut.GetSummaryAsync(1, -180);

        Assert.Equal("2026-10-13", Assert.Single(result.DailyMovements).Date);
        await _repository.Received(1).GetDailyMovementsAsync(
            new DateTime(2026, 10, 13, 3, 0, 0, DateTimeKind.Utc),
            Arg.Any<DateTime>(),
            -180,
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetSummaryAsync_SumsMovementsInThePeriodAndComputesCoverage()
    {
        var sut = CreateSut(new DateTimeOffset(2026, 10, 13, 15, 0, 0, TimeSpan.Zero));
        _repository.GetOverviewAsync(Arg.Any<CancellationToken>()).Returns(new StockOverview(10, 2, 4));
        _repository.GetMovementsByTypeAsync(default, default, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(new[]
            {
                new MovementTypeCount(MovementType.Entry, 5),
                new MovementTypeCount(MovementType.Exit, 3)
            });
        _repository.GetCriticalProductsAsync(default, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(new[]
            {
                new CriticalProduct(1, "FR-001", "Frita", UnitOfMeasure.Kg, 25m, 100m)
            });

        var result = await sut.GetSummaryAsync(30, 0);

        Assert.Equal(8, result.Overview.MovementsInPeriod);
        Assert.Equal(2, result.Overview.BelowMinimum);
        Assert.Equal(0.25m, Assert.Single(result.CriticalProducts).Coverage);
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}
