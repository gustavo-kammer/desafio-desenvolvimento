using Estoque.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Estoque.Infra.Data.Configurations;

public sealed class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    private static readonly DateTime SeedDate = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public void Configure(EntityTypeBuilder<ProductCategory> builder)
    {
        builder.ToTable("product_categories");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).HasMaxLength(120).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(500);
        builder.HasIndex(c => c.Name).IsUnique();

        builder.HasMany(c => c.Products)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new { Id = 1, Name = "Matérias-primas", Description = "Insumos minerais e químicos base da produção", CreatedAt = SeedDate },
            new { Id = 2, Name = "Fritas e esmaltes", Description = "Fritas cerâmicas e esmaltes", CreatedAt = SeedDate },
            new { Id = 3, Name = "Cores cerâmicas", Description = "Pigmentos e cores cerâmicas", CreatedAt = SeedDate },
            new { Id = 4, Name = "Aditivos e mediums", Description = "Aditivos, mediums e auxiliares de processo", CreatedAt = SeedDate },
            new { Id = 5, Name = "Meios de moagem", Description = "Corpos moedores para moagem", CreatedAt = SeedDate },
            new { Id = 6, Name = "Tintas de impressão digital", Description = "Tintas e esmaltes para impressão digital", CreatedAt = SeedDate });
    }
}