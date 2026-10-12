using Estoque.Domain.Common;
using Estoque.Domain.Exceptions;

namespace Estoque.Domain.Entities;

public class Stock
{
    private Stock() { }

    public Stock(Product product)
    {
        Product = product;
        UpdatedAt = DateTime.UtcNow;
    }

    public int ProductId { get; private set; }
    public decimal TotalQuantity { get; private set; }
    public decimal ReservedQuantity { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public uint Version { get; private set; }

    public Product Product { get; private set; } = null!;

    public decimal AvailableQuantity => TotalQuantity - ReservedQuantity;

    public void Add(decimal quantity)
    {
        Guard.ValidQuantity(quantity);
        TotalQuantity += quantity;
        Touch();
    }

    public void Remove(decimal quantity)
    {
        Guard.ValidQuantity(quantity);
        EnsureAvailable(quantity);
        TotalQuantity -= quantity;
        Touch();
    }

    public void Reserve(decimal quantity)
    {
        Guard.ValidQuantity(quantity);
        EnsureAvailable(quantity);
        ReservedQuantity += quantity;
        Touch();
    }

    public void ReleaseReservation(decimal quantity)
    {
        Guard.ValidQuantity(quantity);
        EnsureReserved(quantity);
        ReservedQuantity -= quantity;
        Touch();
    }

    public void ConsumeReservation(decimal quantity)
    {
        Guard.ValidQuantity(quantity);
        EnsureReserved(quantity);
        ReservedQuantity -= quantity;
        TotalQuantity -= quantity;
        Touch();
    }

    private void EnsureAvailable(decimal quantity)
    {
        if (quantity > AvailableQuantity)
            throw new InsufficientStockException(ProductId, quantity, AvailableQuantity);
    }

    private void EnsureReserved(decimal quantity)
    {
        if (quantity > ReservedQuantity)
            throw new BusinessRuleException("A quantidade excede o total reservado.", ErrorCodes.ReservedQuantityExceeded);
    }

    private void Touch() => UpdatedAt = DateTime.UtcNow;
}