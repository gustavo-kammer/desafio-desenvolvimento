using System.ComponentModel.DataAnnotations;
using Estoque.Domain.Enums;

namespace Estoque.Application.Products;

public sealed record CreateProductRequest(
    int CategoryId,
    [Required, StringLength(40, MinimumLength = 1)] string Code,
    [Required, StringLength(150, MinimumLength = 1)] string Name,
    UnitOfMeasure Unit,
    decimal MinimumStock = 0,
    [StringLength(500)] string? Description = null);

public sealed record UpdateProductRequest(
    int CategoryId,
    [Required, StringLength(150, MinimumLength = 1)] string Name,
    decimal MinimumStock,
    [StringLength(500)] string? Description = null);