using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Movements;

public interface IMovementStrategy
{
    MovementType Type { get; }
    Task<StockMovement> ExecuteAsync(MovementRequest request, int userId, CancellationToken ct = default);
}
