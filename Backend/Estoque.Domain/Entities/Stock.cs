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
        EnsurePositive(quantity);
        TotalQuantity += quantity;
        Touch();
    }

    public void Remove(decimal quantity)
    {
        EnsurePositive(quantity);
        EnsureAvailable(quantity);
        TotalQuantity -= quantity;
        Touch();
    }

    public void Reserve(decimal quantity)
    {
        EnsurePositive(quantity);
        EnsureAvailable(quantity);
        ReservedQuantity += quantity;
        Touch();
    }

    public void ReleaseReservation(decimal quantity)
    {
        EnsurePositive(quantity);
        EnsureReserved(quantity);
        ReservedQuantity -= quantity;
        Touch();
    }

    public void ConsumeReservation(decimal quantity)
    {
        EnsurePositive(quantity);
        EnsureReserved(quantity);
        ReservedQuantity -= quantity;
        TotalQuantity -= quantity;
        Touch();
    }

    private static void EnsurePositive(decimal quantity)
    {
        if (quantity <= 0)
            throw new BusinessRuleException("A quantidade deve ser maior que zero.", "invalid_quantity");
    }

    private void EnsureAvailable(decimal quantity)
    {
        if (quantity > AvailableQuantity)
            throw new InsufficientStockException(ProductId, quantity, AvailableQuantity);
    }

    private void EnsureReserved(decimal quantity)
    {
        if (quantity > ReservedQuantity)
            throw new BusinessRuleException("A quantidade excede o total reservado.", "reserved_quantity_exceeded");
    }

    private void Touch() => UpdatedAt = DateTime.UtcNow;
}