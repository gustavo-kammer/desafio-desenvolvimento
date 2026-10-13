using Estoque.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Estoque.API.Errors;

internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        var error = Map(exception);

        if (error.Status >= 500)
            logger.LogError(exception, "Erro não tratado em {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);

        await ProblemResponse.WriteAsync(httpContext, error.Status, error.Title, error.Detail, error.Code, ct);
        return true;
    }

    private static ApiError Map(Exception exception) => exception switch
    {
        NotFoundException e => new(404, "Recurso não encontrado.", e.Message, e.ErrorCode),
        UnauthorizedException e => new(401, "Não autenticado.", e.Message, e.ErrorCode),
        ConflictException e => new(409, "Conflito.", e.Message, e.ErrorCode),
        AppException e => new(422, "Regra de negócio violada.", e.Message, e.ErrorCode),

        DbUpdateConcurrencyException => new(409, "Conflito de concorrência.",
            "O registro foi alterado por outra operação. Tente novamente.", ApiErrorCodes.ConcurrencyConflict),

        DbUpdateException { InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } } =>
            new(409, "Conflito.", "Já existe um registro com esse valor.", ApiErrorCodes.DuplicateValue),

        ArgumentException e => new(400, "Requisição inválida.",
            $"Valor inválido para '{e.ParamName}'.", ApiErrorCodes.InvalidRequest),

        _ => new(500, "Erro interno.", "Ocorreu um erro inesperado.", ApiErrorCodes.InternalError)
    };

    private sealed record ApiError(int Status, string Title, string Detail, string Code);
}