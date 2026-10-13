using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Estoque.API.OpenApi;

internal sealed class ApiDocumentTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(
        OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        document.Info = new OpenApiInfo
        {
            Title = "Estoque API",
            Version = "v1",
            Description = "API de gestão de produtos e controle de estoque: entradas, saídas, reservas, " +
                          "ajustes manuais e histórico de movimentações, com autenticação JWT e perfis de acesso."
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Cole apenas o token retornado por POST /api/auth/login (sem a palavra Bearer)."
        };

        document.Security =
        [
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            }
        ];

        return Task.CompletedTask;
    }
}