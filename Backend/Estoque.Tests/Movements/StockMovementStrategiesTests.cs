using Estoque.Application.Movements;
using Estoque.Application.Movements.Strategies;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;
using NSubstitute;

namespace Estoque.Tests.Movements;

public class StockMovementStrategiesTests
{
    private const int UserId = 7;

    private readonly IProductRepository _products = Substitute.For<IProductRepository>();
    private readonly IStockMovementRepository _movements = Substitute.For<IStockMovementRepository>();

    private Product GivenProduct(decimal total = 10m, decimal reserved = 0m)
    {
        var product = new Product(1, "FR-001", "Frita transparente", UnitOfMeasure.Kg);
        if (total > 0)
            product.Stock.Add(total);
        if (reserved > 0)
            product.Stock.Reserve(reserved);

        _products.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(product);
        return product;
    }

    [Fact]
    public async Task Exit_DecreasesStockAndRegistersBalances()
    {
        var product = GivenProduct(total: 10m);
        var sut = new ExitStrategy(_products, _movements);

        var movement = await sut.ExecuteAsync(new MovementRequest(1, 4m, MovementReason.Shipment), UserId);

        Assert.Equal(6m, product.Stock.TotalQuantity);
        Assert.Equal(MovementType.Exit, movement.Type);
        Assert.Equal(10m, movement.TotalBefore);
        Assert.Equal(6m, movement.TotalAfter);
        Assert.Equal(MovementReason.Shipment, movement.Reason);
        Assert.Equal(UserId, movement.UserId);
        _movements.Received(1).Add(movement);
    }

    [Fact]
    public async Task Exit_CannotTakeReservedQuantity()
    {
        var product = GivenProduct(total: 10m, reserved: 8m);
        var sut = new ExitStrategy(_products, _movements);

        var ex = await Assert.ThrowsAsync<InsufficientStockException>(
            () => sut.ExecuteAsync(new MovementRequest(1, 3m), UserId));

        Assert.Equal(ErrorCodes.InsufficientStock, ex.ErrorCode);
        Assert.Equal(10m, product.Stock.TotalQuantity);
        _movements.DidNotReceive().Add(Arg.Any<StockMovement>());
    }

    [Fact]
    public async Task AdjustmentIn_WithReasonAndJustification_IncreasesStock()
    {
        var product = GivenProduct(total: 10m);
        var sut = new AdjustmentInStrategy(_products, _movements);
        var request = new MovementRequest(1, 2m, MovementReason.InventoryCorrection, "Contagem física");

        var movement = await sut.ExecuteAsync(request, UserId);

        Assert.Equal(12m, product.Stock.TotalQuantity);
        Assert.Equal(MovementType.AdjustmentIn, movement.Type);
        Assert.Equal("Contagem física", movement.Justification);
        _movements.Received(1).Add(movement);
    }

    [Fact]
    public async Task AdjustmentOut_WithReasonAndJustification_DecreasesStock()
    {
        var product = GivenProduct(total: 10m);
        var sut = new AdjustmentOutStrategy(_products, _movements);
        var request = new MovementRequest(1, 3m, MovementReason.Loss, "Embalagem rompida");

        var movement = await sut.ExecuteAsync(request, UserId);

        Assert.Equal(7m, product.Stock.TotalQuantity);
        Assert.Equal(MovementType.AdjustmentOut, movement.Type);
        Assert.Equal(MovementReason.Loss, movement.Reason);
    }

    [Fact]
    public async Task AdjustmentOut_MoreThanAvailable_Throws()
    {
        GivenProduct(total: 10m, reserved: 6m);
        var sut = new AdjustmentOutStrategy(_products, _movements);
        var request = new MovementRequest(1, 5m, MovementReason.Loss, "Perda");

        await Assert.ThrowsAsync<InsufficientStockException>(() => sut.ExecuteAsync(request, UserId));

        _movements.DidNotReceive().Add(Arg.Any<StockMovement>());
    }

    [Theory]
    [InlineData(null, "Justificativa")]
    [InlineData(MovementReason.Loss, null)]
    [InlineData(MovementReason.Loss, "   ")]
    public async Task Adjustment_WithoutReasonOrJustification_Throws(MovementReason? reason, string? justification)
    {
        GivenProduct(total: 10m);
        var increase = new AdjustmentInStrategy(_products, _movements);
        var decrease = new AdjustmentOutStrategy(_products, _movements);
        var request = new MovementRequest(1, 1m, reason, justification);

        var inEx = await Assert.ThrowsAsync<BusinessRuleException>(() => increase.ExecuteAsync(request, UserId));
        var outEx = await Assert.ThrowsAsync<BusinessRuleException>(() => decrease.ExecuteAsync(request, UserId));

        Assert.Equal(ErrorCodes.AdjustmentRequiresJustification, inEx.ErrorCode);
        Assert.Equal(ErrorCodes.AdjustmentRequiresJustification, outEx.ErrorCode);
        _movements.DidNotReceive().Add(Arg.Any<StockMovement>());
    }

    [Fact]
    public async Task Exit_ProductNotFound_ThrowsNotFound()
    {
        _products.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns((Product?)null);
        var sut = new ExitStrategy(_products, _movements);

        await Assert.ThrowsAsync<NotFoundException>(() => sut.ExecuteAsync(new MovementRequest(99, 1m), UserId));
    }

    [Fact]
    public void Resolver_ReturnsTheStrategyRegisteredForEachType()
    {
        IMovementStrategy[] strategies =
        [
            new EntryStrategy(_products, _movements),
            new ExitStrategy(_products, _movements),
            new AdjustmentInStrategy(_products, _movements),
            new AdjustmentOutStrategy(_products, _movements)
        ];
        var resolver = new MovementStrategyResolver(strategies);

        foreach (var type in new[]
                 {
                     MovementType.Entry, MovementType.Exit, MovementType.AdjustmentIn, MovementType.AdjustmentOut
                 })
        {
            Assert.Equal(type, resolver.Resolve(type).Type);
        }
    }

    [Fact]
    public void Resolver_UnsupportedType_ThrowsBusinessRule()
    {
        var resolver = new MovementStrategyResolver([new EntryStrategy(_products, _movements)]);

        Assert.Throws<BusinessRuleException>(() => resolver.Resolve(MovementType.Reservation));
    }
}
