using Estoque.Domain.Common;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Domain.Repositories;

public interface IStockMovementRepository
{
    Task<PagedResult<StockMovement>> ListAsync(StockMovementFilter filter, CancellationToken ct = default);
    void Add(StockMovement movement);
}

public sealed record StockMovementFilter(
    int? ProductId = null,
    int? UserId = null,
    MovementType? Type = null,
    DateTime? From = null,
    DateTime? To = null,
    int Page = 1,
    int PageSize = 20);