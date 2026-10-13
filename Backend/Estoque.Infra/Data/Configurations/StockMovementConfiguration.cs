using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Infra.Data.Conversions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Estoque.Infra.Data.Configurations;

public sealed class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements", t =>
        {
            t.HasCheckConstraint("ck_stock_movements_type", SnakeCase.EnumIn<MovementType>("type"));
            t.HasCheckConstraint("ck_stock_movements_reason",
                $"reason IS NULL OR {SnakeCase.EnumIn<MovementReason>("reason")}");
            t.HasCheckConstraint("ck_stock_movements_quantity_positive", "quantity > 0");
            t.HasCheckConstraint("ck_stock_movements_balances_non_negative",
                "total_before >= 0 AND total_after >= 0 AND reserved_before >= 0 AND reserved_after >= 0");
            t.HasCheckConstraint("ck_stock_movements_reservation_required",
                "type NOT IN ('reservation', 'reservation_cancellation', 'reservation_consumption') " +
                "OR reservation_id IS NOT NULL");
            t.HasCheckConstraint("ck_stock_movements_adjustment_justified",
                "type NOT IN ('adjustment_in', 'adjustment_out') " +
                "OR (reason IS NOT NULL AND length(trim(justification)) > 0)");
        });

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Type)
            .HasConversion(new SnakeCaseEnumConverter<MovementType>())
            .HasMaxLength(30)
            .IsRequired();
        builder.Property(m => m.Reason)
            .HasConversion(new SnakeCaseEnumConverter<MovementReason>())
            .HasMaxLength(30);
        builder.Property(m => m.Quantity).HasPrecision(18, 3);
        builder.Property(m => m.TotalBefore).HasPrecision(18, 3);
        builder.Property(m => m.TotalAfter).HasPrecision(18, 3);
        builder.Property(m => m.ReservedBefore).HasPrecision(18, 3);
        builder.Property(m => m.ReservedAfter).HasPrecision(18, 3);
        builder.Property(m => m.Justification).HasMaxLength(500);
        builder.Property(m => m.ReferenceDocument).HasMaxLength(100);

        builder.HasOne(m => m.Product).WithMany()
            .HasForeignKey(m => m.ProductId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(m => m.Reservation).WithMany()
            .HasForeignKey(m => m.ReservationId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(m => m.User).WithMany()
            .HasForeignKey(m => m.UserId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => new { m.ProductId, m.OccurredAt }).IsDescending(false, true);
        builder.HasIndex(m => m.UserId);
        builder.HasIndex(m => m.ReservationId);
        builder.HasIndex(m => m.Type);
        builder.HasIndex(m => m.OccurredAt);
    }
}