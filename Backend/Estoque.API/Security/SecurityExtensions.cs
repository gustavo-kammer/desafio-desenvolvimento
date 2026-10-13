using System.Text;
using Estoque.API.Errors;
using Estoque.Application.Abstractions;
using Estoque.Domain.Enums;
using Estoque.Infra.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;

namespace Estoque.API.Security;

public static class SecurityExtensions
{
    public static IServiceCollection AddApiSecurity(this IServiceCollection services, IConfiguration configuration)
    {
        var jwt = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("A seção 'Jwt' não está configurada.");

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = "name",
                    RoleClaimType = "role"
                };

                options.Events = new JwtBearerEvents
                {
                    OnChallenge = context =>
                    {
                        context.HandleResponse();
                        return ProblemResponse.WriteAsync(context.HttpContext, StatusCodes.Status401Unauthorized,
                            "Não autenticado.", "Token ausente, inválido ou expirado.", ApiErrorCodes.Unauthorized);
                    },
                    OnForbidden = context => ProblemResponse.WriteAsync(context.HttpContext,
                        StatusCodes.Status403Forbidden, "Acesso negado.",
                        "Seu perfil não tem permissão para esta operação.", ApiErrorCodes.Forbidden)
                };
            });

        var admin = nameof(UserRole.Administrator);
        var operador = nameof(UserRole.Operator);

        services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
            .AddPolicy(Policies.ManageUsers, p => p.RequireRole(admin))
            .AddPolicy(Policies.ManageProducts, p => p.RequireRole(admin))
            .AddPolicy(Policies.OperateStock, p => p.RequireRole(admin, operador))
            .AddPolicy(Policies.AdjustStock, p => p.RequireRole(admin));

        return services;
    }
}