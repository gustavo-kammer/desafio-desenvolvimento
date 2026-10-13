using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Infra.Data.Conversions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Estoque.Infra.Data.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users", t =>
        {
            t.HasCheckConstraint("ck_users_email_lowercase", "email = lower(email)");
            t.HasCheckConstraint("ck_users_role", SnakeCase.EnumIn<UserRole>("role"));
        });

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Name).HasMaxLength(120).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(160).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
        builder.Property(u => u.Role)
            .HasConversion(new SnakeCaseEnumConverter<UserRole>())
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(u => u.Email).IsUnique();
    }
}