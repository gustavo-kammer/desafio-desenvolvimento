using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Reservations;

public sealed record ReservationDto(
    int Id,
    int ProductId,
    decimal Quantity,
    ReservationStatus Status,
    int CreatedById,
    int? ClosedById,
    DateTime CreatedAt,
    DateTime? ClosedAt)
{
    public static ReservationDto From(Reservation r) => new(
        r.Id, r.ProductId, r.Quantity, r.Status,
        r.CreatedById, r.ClosedById, r.CreatedAt, r.ClosedAt);
}