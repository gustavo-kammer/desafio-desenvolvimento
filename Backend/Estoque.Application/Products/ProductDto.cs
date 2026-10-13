using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Products;

public sealed record ProductStockDto(decimal TotalQuantity, decimal ReservedQuantity, decimal AvailableQuantity);

public sealed record ProductDto(
    int Id,
    CategoryDto? Category,
    string Code,
    string Name,
    string? Description,
    UnitOfMeasure Unit,
    decimal MinimumStock,
    ProductStockDto Stock,
    bool BelowMinimumStock,
    DateTime CreatedAt,
    DateTime UpdatedAt)
{
    public static ProductDto From(Product p) => new(
        p.Id,
        p.Category is null ? null : CategoryDto.From(p.Category),
        p.Code, p.Name, p.Description, p.Unit, p.MinimumStock,
        new ProductStockDto(p.Stock.TotalQuantity, p.Stock.ReservedQuantity, p.Stock.AvailableQuantity),
        p.IsBelowMinimumStock, p.CreatedAt, p.UpdatedAt);
}