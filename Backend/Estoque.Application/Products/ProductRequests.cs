using Estoque.Domain.Enums;

namespace Estoque.Application.Products;

public sealed record CreateProductRequest(
    int CategoryId,
    string Code,
    string Name,
    UnitOfMeasure Unit,
    decimal MinimumStock = 0,
    string? Description = null);

public sealed record UpdateProductRequest(
    int CategoryId,
    string Name,
    decimal MinimumStock,
    string? Description = null);