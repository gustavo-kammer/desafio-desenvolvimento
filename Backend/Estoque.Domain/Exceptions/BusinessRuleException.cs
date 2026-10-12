namespace Estoque.Domain.Exceptions;

public class BusinessRuleException(string message, string errorCode = ErrorCodes.BusinessRule) : AppException(message, errorCode);
