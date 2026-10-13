using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class ReservationRepository(AppDbContext db) : IReservationRepository
{
    public Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Reservations.FirstOrDefaultAsync(r => r.Id == id, ct);

    public Task<bool> HasActiveForProductAsync(int productId, CancellationToken ct = default) =>
        db.Reservations.AnyAsync(r => r.ProductId == productId && r.Status == ReservationStatus.Active, ct);

    public void Add(Reservation reservation) => db.Reservations.Add(reservation);
}