using Estoque.Application.Movements;
using Estoque.Application.Movements.Strategies;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;
using NSubstitute;

namespace Estoque.Tests.Movements;

public class EntryStrategyTests
{
    private const int UserId = 7;

    private readonly IProductRepository _products = Substitute.For<IProductRepository>();
    private readonly IStockMovementRepository _movements = Substitute.For<IStockMovementRepository>();
    private readonly EntryStrategy _sut;

    public EntryStrategyTests() => _sut = new EntryStrategy(_products, _movements);

    private Product GivenProduct(UnitOfMeasure unit = UnitOfMeasure.Kg, decimal initialStock = 0)
    {
        var product = new Product(1, "FR-001", "Frita transparente", unit);
        if (initialStock > 0)
            product.Stock.Add(initialStock);

        _products.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(product);
        return product;
    }

    [Fact]
    public async Task ExecuteAsync_IncreasesStockAndRegistersMovement()
    {
        var product = GivenProduct(initialStock: 10m);
        var request = new MovementRequest(1, 5m, ReferenceDocument: "NF-123");

        var movement = await _sut.ExecuteAsync(request, UserId);

        Assert.Equal(15m, product.Stock.TotalQuantity);
        Assert.Equal(MovementType.Entry, movement.Type);
        Assert.Equal(5m, movement.Quantity);
        Assert.Equal(10m, movement.TotalBefore);
        Assert.Equal(15m, movement.TotalAfter);
        Assert.Equal(UserId, movement.UserId);
        Assert.Equal("NF-123", movement.ReferenceDocument);
        _movements.Received(1).Add(movement);
    }

    [Fact]
    public async Task ExecuteAsync_ProductNotFound_ThrowsNotFound()
    {
        _products.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _sut.ExecuteAsync(new MovementRequest(99, 5m), UserId));

        _movements.DidNotReceive().Add(Arg.Any<StockMovement>());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(1.2345)]
    public async Task ExecuteAsync_InvalidQuantity_ThrowsAndLeavesStockUntouched(double quantity)
    {
        var product = GivenProduct(initialStock: 10m);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(
            () => _sut.ExecuteAsync(new MovementRequest(1, (decimal)quantity), UserId));

        Assert.Equal(ErrorCodes.InvalidQuantity, ex.ErrorCode);
        Assert.Equal(10m, product.Stock.TotalQuantity);
        _movements.DidNotReceive().Add(Arg.Any<StockMovement>());
    }

    [Fact]
    public async Task ExecuteAsync_FractionalQuantityForUnitProduct_Throws()
    {
        GivenProduct(UnitOfMeasure.Unit);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(
            () => _sut.ExecuteAsync(new MovementRequest(1, 1.5m), UserId));

        Assert.Equal(ErrorCodes.InvalidQuantity, ex.ErrorCode);
    }
}