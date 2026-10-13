using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Movements;

public sealed record MovementProductDto(int Id, string Code, string Name, UnitOfMeasure Unit);

public sealed record MovementUserDto(int Id, string Name, string Email);

public sealed record StockMovementDto(
    int Id,
    MovementProductDto Product,
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
    MovementUserDto User,
    DateTime OccurredAt)
{
    public static StockMovementDto From(StockMovement m) => new(
        m.Id,
        new MovementProductDto(m.Product.Id, m.Product.Code, m.Product.Name, m.Product.Unit),
        m.ReservationId, m.Type, m.Quantity,
        m.TotalBefore, m.TotalAfter, m.ReservedBefore, m.ReservedAfter,
        m.Reason, m.Justification, m.ReferenceDocument,
        new MovementUserDto(m.User.Id, m.User.Name, m.User.Email),
        m.OccurredAt);
}