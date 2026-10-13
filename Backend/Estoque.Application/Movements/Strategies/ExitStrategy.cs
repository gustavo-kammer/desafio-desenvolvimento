using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Movements.Strategies;

public sealed class ExitStrategy(IProductRepository products, IStockMovementRepository movements) : MovementStrategyBase(products, movements)
{
    public override MovementType Type => MovementType.Exit;

    protected override void Apply(Stock stock, decimal quantity) => stock.Remove(quantity);
}