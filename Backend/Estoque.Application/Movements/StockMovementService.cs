using Estoque.Application.Abstractions;
using Estoque.Application.Movements.Strategies;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Movements;

public sealed class StockMovementService(
    MovementStrategyResolver resolver,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork) : IStockMovementService
{
    public async Task<StockMovementDto> RegisterAsync(
        MovementType type, MovementRequest request, CancellationToken ct = default)
    {
        var strategy = resolver.Resolve(type);
        var movement = await strategy.ExecuteAsync(request, currentUser.Id, ct);

        await unitOfWork.CommitAsync(ct);

        return StockMovementDto.From(movement);
    }
}