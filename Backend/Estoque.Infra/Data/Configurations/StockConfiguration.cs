using Estoque.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Estoque.Infra.Data.Configurations;

public sealed class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("stocks", t =>
        {
            t.HasCheckConstraint("ck_stocks_total_non_negative", "total_quantity >= 0");
            t.HasCheckConstraint("ck_stocks_reserved_non_negative", "reserved_quantity >= 0");
            t.HasCheckConstraint("ck_stocks_reserved_within_total", "reserved_quantity <= total_quantity");
        });

        builder.HasKey(s => s.ProductId);
        builder.Property(s => s.TotalQuantity).HasPrecision(18, 3);
        builder.Property(s => s.ReservedQuantity).HasPrecision(18, 3);

        builder.Property(s => s.Version)
            .HasColumnName("xmin")
            .HasColumnType("xid")
            .ValueGeneratedOnAddOrUpdate()
            .IsConcurrencyToken();

        builder.HasOne(s => s.Product)
            .WithOne(p => p.Stock)
            .HasForeignKey<Stock>(s => s.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}