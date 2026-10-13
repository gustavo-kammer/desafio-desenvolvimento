using Estoque.Application.Abstractions;
using Estoque.Domain.Common;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Movements;

public sealed class StockMovementService(
    MovementStrategyResolver resolver,
    IStockMovementRepository movements,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork) : IStockMovementService
{
    public async Task<StockMovementDto> RegisterAsync(
        MovementType type, MovementRequest request, CancellationToken ct = default)
    {
        var strategy = resolver.Resolve(type);
        var movement = await strategy.ExecuteAsync(request, currentUser.Id, ct);

        await unitOfWork.CommitAsync(ct);

        var saved = await movements.GetByIdAsync(movement.Id, ct) ?? movement;
        return StockMovementDto.From(saved);
    }

    public async Task<PagedResult<StockMovementDto>> ListAsync(
        StockMovementFilter filter, CancellationToken ct = default)
    {
        var page = await movements.ListAsync(filter, ct);
        return page.Map(StockMovementDto.From);
    }
}