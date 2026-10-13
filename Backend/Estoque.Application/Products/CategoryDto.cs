using Estoque.Domain.Entities;

namespace Estoque.Application.Products;

public sealed record CategoryDto(int Id, string Name, string? Description)
{
    public static CategoryDto From(ProductCategory c) => new(c.Id, c.Name, c.Description);
}