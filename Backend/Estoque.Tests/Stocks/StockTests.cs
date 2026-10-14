using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;

namespace Estoque.Tests.Stocks;

public class StockTests
{
    private static Stock GivenStock(decimal total = 0m, decimal reserved = 0m)
    {
        var stock = new Product(1, "FR-001", "Frita transparente", UnitOfMeasure.Kg).Stock;
        if (total > 0)
            stock.Add(total);
        if (reserved > 0)
            stock.Reserve(reserved);
        return stock;
    }

    [Fact]
    public void Add_IncreasesTotalAndAvailable()
    {
        var stock = GivenStock(total: 10m);

        stock.Add(5m);

        Assert.Equal(15m, stock.TotalQuantity);
        Assert.Equal(15m, stock.AvailableQuantity);
    }

    [Fact]
    public void Reserve_ReducesAvailableButKeepsTotal()
    {
        var stock = GivenStock(total: 10m);

        stock.Reserve(4m);

        Assert.Equal(10m, stock.TotalQuantity);
        Assert.Equal(4m, stock.ReservedQuantity);
        Assert.Equal(6m, stock.AvailableQuantity);
    }

    [Fact]
    public void Reserve_MoreThanAvailable_ThrowsInsufficientStock()
    {
        var stock = GivenStock(total: 10m, reserved: 8m);

        var ex = Assert.Throws<InsufficientStockException>(() => stock.Reserve(3m));

        Assert.Equal(ErrorCodes.InsufficientStock, ex.ErrorCode);
        Assert.Equal(8m, stock.ReservedQuantity);
    }

    [Fact]
    public void Remove_UsesOnlyTheAvailableQuantity()
    {
        var stock = GivenStock(total: 10m, reserved: 4m);

        Assert.Throws<InsufficientStockException>(() => stock.Remove(7m));
        Assert.Equal(10m, stock.TotalQuantity);

        stock.Remove(6m);

        Assert.Equal(4m, stock.TotalQuantity);
        Assert.Equal(4m, stock.ReservedQuantity);
        Assert.Equal(0m, stock.AvailableQuantity);
    }

    [Fact]
    public void ReleaseReservation_ReturnsQuantityToAvailable()
    {
        var stock = GivenStock(total: 10m, reserved: 4m);

        stock.ReleaseReservation(3m);

        Assert.Equal(10m, stock.TotalQuantity);
        Assert.Equal(1m, stock.ReservedQuantity);
        Assert.Equal(9m, stock.AvailableQuantity);
    }

    [Fact]
    public void ReleaseReservation_MoreThanReserved_Throws()
    {
        var stock = GivenStock(total: 10m, reserved: 2m);

        var ex = Assert.Throws<BusinessRuleException>(() => stock.ReleaseReservation(3m));

        Assert.Equal(ErrorCodes.ReservedQuantityExceeded, ex.ErrorCode);
    }

    [Fact]
    public void ConsumeReservation_DecreasesTotalAndReserved()
    {
        var stock = GivenStock(total: 10m, reserved: 4m);

        stock.ConsumeReservation(4m);

        Assert.Equal(6m, stock.TotalQuantity);
        Assert.Equal(0m, stock.ReservedQuantity);
        Assert.Equal(6m, stock.AvailableQuantity);
    }

    [Fact]
    public void ConsumeReservation_MoreThanReserved_Throws()
    {
        var stock = GivenStock(total: 10m, reserved: 2m);

        var ex = Assert.Throws<BusinessRuleException>(() => stock.ConsumeReservation(3m));

        Assert.Equal(ErrorCodes.ReservedQuantityExceeded, ex.ErrorCode);
        Assert.Equal(10m, stock.TotalQuantity);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(1.2345)]
    public void AnyOperation_WithInvalidQuantity_ThrowsInvalidQuantity(double quantity)
    {
        var stock = GivenStock(total: 10m, reserved: 5m);
        var value = (decimal)quantity;

        var operations = new Action[]
        {
            () => stock.Add(value),
            () => stock.Remove(value),
            () => stock.Reserve(value),
            () => stock.ReleaseReservation(value),
            () => stock.ConsumeReservation(value)
        };

        foreach (var operation in operations)
        {
            var ex = Assert.Throws<BusinessRuleException>(operation);
            Assert.Equal(ErrorCodes.InvalidQuantity, ex.ErrorCode);
        }
    }
}
