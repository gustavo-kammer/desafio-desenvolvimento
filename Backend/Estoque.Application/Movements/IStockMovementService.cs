using Estoque.Domain.Enums;

namespace Estoque.Application.Movements;

public interface IStockMovementService
{
    Task<StockMovementDto> RegisterAsync(MovementType type, MovementRequest request, CancellationToken ct = default);
}