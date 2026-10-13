using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Errors;

internal static class ProblemResponse
{
    public static Task WriteAsync(
        HttpContext context, int status, string title, string detail, string errorCode,
        CancellationToken ct = default)
    {
        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path.Value
        };
        problem.Extensions["errorCode"] = errorCode;
        problem.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.StatusCode = status;
        return context.Response.WriteAsJsonAsync(
            problem, options: null, contentType: "application/problem+json", cancellationToken: ct);
    }
}