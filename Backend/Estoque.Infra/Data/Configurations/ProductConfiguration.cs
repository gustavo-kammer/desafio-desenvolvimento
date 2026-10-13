using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Infra.Data.Conversions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Estoque.Infra.Data.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products", t =>
        {
            t.HasCheckConstraint("ck_products_unit", SnakeCase.EnumIn<UnitOfMeasure>("unit"));
            t.HasCheckConstraint("ck_products_minimum_stock", "minimum_stock >= 0");
        });

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Code).HasMaxLength(40).IsRequired();
        builder.Property(p => p.Name).HasMaxLength(150).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(500);
        builder.Property(p => p.Unit)
            .HasConversion(new SnakeCaseEnumConverter<UnitOfMeasure>())
            .HasMaxLength(10)
            .IsRequired();
        builder.Property(p => p.MinimumStock).HasPrecision(18, 3);

        builder.HasIndex(p => p.Code).IsUnique();
        builder.HasIndex(p => p.Name);
    }
}