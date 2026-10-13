namespace Estoque.API.Errors;

internal static class ApiErrorCodes
{
    public const string Unauthorized = "unauthorized";
    public const string Forbidden = "forbidden";
    public const string InvalidRequest = "invalid_request";
    public const string ConcurrencyConflict = "concurrency_conflict";
    public const string DuplicateValue = "duplicate_value";
    public const string InternalError = "internal_error";
}