namespace Estoque.Domain.Exceptions;

public class UnauthorizedException(string message) : AppException(message, ErrorCodes.InvalidCredentials);