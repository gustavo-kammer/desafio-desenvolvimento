namespace Estoque.Domain.Exceptions;

public sealed class InsufficientStockException(int productId, decimal requested, decimal available)
    : BusinessRuleException(
        $"Saldo insuficiente para o produto {productId}: solicitado {requested}, disponível {available}.",
        ErrorCodes.InsufficientStock);
