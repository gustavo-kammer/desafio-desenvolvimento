using Estoque.Domain.Common;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;

namespace Estoque.Domain.Entities;

public class Product
{
    private Product() { }
    public Product(int categoryId, string code, string name, UnitOfMeasure unit, decimal minimumStock = 0, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        EnsureMinimumStockIsValid(minimumStock);

        CategoryId = categoryId;
        Code = code.Trim();
        Name = name.Trim();
        Unit = unit;
        MinimumStock = minimumStock;
        Description = description;
        CreatedAt = UpdatedAt = DateTime.UtcNow;
        Stock = new Stock(this);
    }
    public int Id { get; private set; }
    public int CategoryId { get; private set; }
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public UnitOfMeasure Unit { get; private set; }
    public decimal MinimumStock { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public DateTime? ArchivedAt { get; private set; }

    public ProductCategory Category { get; private set; } = null!;
    public Stock Stock { get; private set; } = null!;

    public bool IsArchived => ArchivedAt.HasValue;


    public void Update(int categoryId, string name, string? description, decimal minimumStock)
    {
        EnsureNotArchived();
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        EnsureMinimumStockIsValid(minimumStock);

        CategoryId = categoryId;
        Name = name.Trim();
        Description = description;
        MinimumStock = minimumStock;
        UpdatedAt = DateTime.UtcNow;

    }

    public void Archive()
    {
        EnsureNotArchived();
        ArchivedAt = UpdatedAt = DateTime.UtcNow;
    }

    public void EnsureQuantityIsValid(decimal quantity)
    {
        Guard.ValidQuantity(quantity);

        if (Unit == UnitOfMeasure.Unit && quantity != decimal.Truncate(quantity))
            throw new BusinessRuleException("Produtos em unidade só aceitam quantidades inteiras.", ErrorCodes.InvalidQuantity);
    }

    private void EnsureNotArchived()
    {
        if (IsArchived)
            throw new ConflictException("O produto está arquivado.");
    }

    private static void EnsureMinimumStockIsValid(decimal minimumStock)
    {
        if (minimumStock < 0)
            throw new BusinessRuleException("O estoque mínimo não pode ser negativo.", ErrorCodes.InvalidMinimumStock);
    }

}
