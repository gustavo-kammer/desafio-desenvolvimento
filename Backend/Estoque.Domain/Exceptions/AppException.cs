namespace Estoque.Domain.Exceptions;

public abstract class AppException(string message, string errorCode) : Exception(message)
{
    public string ErrorCode { get; } = errorCode;
}
