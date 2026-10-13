using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Application.Reservations;

public sealed record ReservationProductDto(int Id, string Code, string Name, UnitOfMeasure Unit);

public sealed record ReservationUserDto(int Id, string Name, string Email);

public sealed record ReservationDto(
    int Id,
    ReservationProductDto? Product,
    decimal Quantity,
    ReservationStatus Status,
    ReservationUserDto? CreatedBy,
    ReservationUserDto? ClosedBy,
    DateTime CreatedAt,
    DateTime? ClosedAt)
{
    public static ReservationDto From(Reservation r) => new(
        r.Id,
        r.Product is null ? null : new ReservationProductDto(r.Product.Id, r.Product.Code, r.Product.Name, r.Product.Unit),
        r.Quantity, r.Status,
        r.CreatedBy is null ? null : new ReservationUserDto(r.CreatedBy.Id, r.CreatedBy.Name, r.CreatedBy.Email),
        r.ClosedBy is null ? null : new ReservationUserDto(r.ClosedBy.Id, r.ClosedBy.Name, r.ClosedBy.Email),
        r.CreatedAt, r.ClosedAt);
}