using Estoque.Domain.Common;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Movements;

public interface IStockMovementService
{
    Task<StockMovementDto> RegisterAsync(MovementType type, MovementRequest request, CancellationToken ct = default);
    Task<PagedResult<StockMovementDto>> ListAsync(StockMovementFilter filter, CancellationToken ct = default);
}