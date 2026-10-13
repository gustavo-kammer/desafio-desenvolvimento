using Estoque.Application.Abstractions;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Estoque.Infra.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(this IServiceProvider services, CancellationToken ct = default)
    {
        await using var scope = services.CreateAsyncScope();
        var provider = scope.ServiceProvider;

        var db = provider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync(ct);

        if (await db.Users.AnyAsync(ct))
            return;

        var configuration = provider.GetRequiredService<IConfiguration>();
        var logger = provider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseInitializer");

        var email = configuration["SeedAdmin:Email"];
        var password = configuration["SeedAdmin:Password"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning("Nenhum usuário existe e a seção SeedAdmin não está configurada: não há como fazer login.");
            return;
        }

        var name = configuration["SeedAdmin:Name"] ?? "Administrador";
        var hasher = provider.GetRequiredService<IPasswordHasher>();

        db.Users.Add(new User(name, email, hasher.Hash(password), UserRole.Administrator));
        await db.SaveChangesAsync(ct);

        logger.LogInformation("Usuário administrador inicial criado: {Email}", email.Trim().ToLowerInvariant());
    }
}