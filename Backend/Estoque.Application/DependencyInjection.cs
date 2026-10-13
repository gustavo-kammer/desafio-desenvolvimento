using Estoque.Application.Auth;
using Estoque.Application.Movements;
using Estoque.Application.Movements.Strategies;
using Estoque.Application.Products;
using Estoque.Application.Reservations;
using Estoque.Application.Users;
using Microsoft.Extensions.DependencyInjection;

namespace Estoque.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IMovementStrategy, EntryStrategy>();
        services.AddScoped<IMovementStrategy, ExitStrategy>();
        services.AddScoped<IMovementStrategy, AdjustmentInStrategy>();
        services.AddScoped<IMovementStrategy, AdjustmentOutStrategy>();
        services.AddScoped<MovementStrategyResolver>();

        services.AddScoped<IStockMovementService, StockMovementService>();
        services.AddScoped<IReservationService, ReservationService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}