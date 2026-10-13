using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Infra.Data.Conversions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Estoque.Infra.Data.Configurations;

public sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.ToTable("reservations", t =>
        {
            t.HasCheckConstraint("ck_reservations_status", SnakeCase.EnumIn<ReservationStatus>("status"));
            t.HasCheckConstraint("ck_reservations_quantity_positive", "quantity > 0");
            t.HasCheckConstraint("ck_reservations_closing_consistency",
                "(status = 'active' AND closed_at IS NULL AND closed_by_id IS NULL) OR " +
                "(status <> 'active' AND closed_at IS NOT NULL AND closed_by_id IS NOT NULL)");
        });

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Quantity).HasPrecision(18, 3);
        builder.Property(r => r.Status)
            .HasConversion(new SnakeCaseEnumConverter<ReservationStatus>())
            .HasMaxLength(20)
            .IsRequired();

        builder.HasOne(r => r.Product).WithMany()
            .HasForeignKey(r => r.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(r => r.CreatedBy).WithMany()
            .HasForeignKey(r => r.CreatedById).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(r => r.ClosedBy).WithMany()
            .HasForeignKey(r => r.ClosedById).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => new { r.ProductId, r.Status });
        builder.HasIndex(r => r.CreatedAt);
    }
}