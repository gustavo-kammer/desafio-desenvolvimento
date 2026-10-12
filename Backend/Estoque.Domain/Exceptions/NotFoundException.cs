namespace Estoque.Domain.Exceptions;

public class NotFoundException(string message) : AppException(message, ErrorCodes.NotFound);
