using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Movements;

public abstract class MovementStrategyBase(IProductRepository products, IStockMovementRepository movements) : IMovementStrategy
{
    public abstract MovementType Type { get; }

    protected abstract void Apply(Stock stock, decimal quantity);

    public async Task<StockMovement> ExecuteAsync(MovementRequest request, int userId, CancellationToken ct = default)
    {
        var product = await products.GetByIdAsync(request.ProductId, ct)
            ?? throw new NotFoundException($"Produto {request.ProductId} não encontrado.");

        product.EnsureQuantityIsValid(request.Quantity);

        var stock = product.Stock;
        var totalBefore = stock.TotalQuantity;
        var reservedBefore = stock.ReservedQuantity;

        Apply(stock, request.Quantity);

        var movement = new StockMovement(
            product.Id, Type, request.Quantity, userId,
            totalBefore, stock.TotalQuantity,
            reservedBefore, stock.ReservedQuantity,
            reason: request.Reason,
            justification: request.Justification,
            referenceDocument: request.ReferenceDocument);

        movements.Add(movement);
        return movement;
    }
}
