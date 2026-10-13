namespace Estoque.Domain.Entities;

public class ProductCategory
{
    private ProductCategory() { }
    public ProductCategory(string name, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name.Trim();
        Description = description;
        CreatedAt = DateTime.UtcNow;
    }

    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public ICollection<Product> Products { get; private set; } = new List<Product>();

    public void Update(string name, string? description)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
    }
}
