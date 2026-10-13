using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Movements;

public sealed record StockMovementDto(
    int Id,
    int ProductId,
    int? ReservationId,
    MovementType Type,
    decimal Quantity,
    decimal TotalBefore,
    decimal TotalAfter,
    decimal ReservedBefore,
    decimal ReservedAfter,
    MovementReason? Reason,
    string? Justification,
    string? ReferenceDocument,
    int UserId,
    DateTime OccurredAt)
{
    public static StockMovementDto From(StockMovement m) => new(
        m.Id, m.ProductId, m.ReservationId, m.Type, m.Quantity,
        m.TotalBefore, m.TotalAfter, m.ReservedBefore, m.ReservedAfter,
        m.Reason, m.Justification, m.ReferenceDocument, m.UserId, m.OccurredAt);
}