using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Products;

public sealed record ProductDto(
    int Id,
    int CategoryId,
    string Code,
    string Name,
    string? Description,
    UnitOfMeasure Unit,
    decimal MinimumStock,
    decimal TotalQuantity,
    decimal ReservedQuantity,
    decimal AvailableQuantity,
    bool BelowMinimumStock,
    DateTime CreatedAt,
    DateTime UpdatedAt)
{
    public static ProductDto From(Product p) => new(
        p.Id, p.CategoryId, p.Code, p.Name, p.Description, p.Unit, p.MinimumStock,
        p.Stock.TotalQuantity, p.Stock.ReservedQuantity, p.Stock.AvailableQuantity,
        p.IsBelowMinimumStock, p.CreatedAt, p.UpdatedAt);
}