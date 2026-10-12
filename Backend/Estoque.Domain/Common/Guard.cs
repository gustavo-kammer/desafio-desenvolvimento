using Estoque.Domain.Exceptions;

namespace Estoque.Domain.Common;

internal static class Guard
{
    private const int QuantityScale = 3;

    public static void ValidQuantity(decimal quantity)
    {
        if (quantity <= 0)
            throw new BusinessRuleException("A quantidade deve ser maior que zero.", ErrorCodes.InvalidQuantity);

        if (decimal.Round(quantity, QuantityScale) != quantity)
            throw new BusinessRuleException(
                $"A quantidade aceita no máximo {QuantityScale} casas decimais.", ErrorCodes.InvalidQuantity);
    }
}
