using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Movements.Strategies;

public sealed class AdjustmentInStrategy(IProductRepository products, IStockMovementRepository movements)
    : MovementStrategyBase(products, movements)
{
    public override MovementType Type => MovementType.AdjustmentIn;

    protected override void Apply(Stock stock, decimal quantity) => stock.Add(quantity);
}