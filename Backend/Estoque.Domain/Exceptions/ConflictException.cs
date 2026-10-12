namespace Estoque.Domain.Exceptions;

public class ConflictException(string message) : AppException(message, ErrorCodes.Conflict);
