using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Estoque.Infra.Data.Repositories;

internal sealed class ReservationRepository(AppDbContext db) : IReservationRepository
{
    private IQueryable<Reservation> Detailed => db.Reservations
        .AsNoTracking()
        .Include(r => r.Product)
        .Include(r => r.CreatedBy)
        .Include(r => r.ClosedBy);

    public Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default) =>
        db.Reservations.FirstOrDefaultAsync(r => r.Id == id, ct);

    public Task<Reservation?> GetDetailedAsync(int id, CancellationToken ct = default) =>
        Detailed.FirstOrDefaultAsync(r => r.Id == id, ct);

    public Task<bool> HasActiveForProductAsync(int productId, CancellationToken ct = default) =>
        db.Reservations.AnyAsync(r => r.ProductId == productId && r.Status == ReservationStatus.Active, ct);

    public async Task<IReadOnlyList<Reservation>> ListAsync(
        ReservationStatus? status, int? productId, CancellationToken ct = default)
    {
        var query = Detailed;

        if (status is { } s) query = query.Where(r => r.Status == s);
        if (productId is { } p) query = query.Where(r => r.ProductId == p);

        return await query.OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id).ToListAsync(ct);
    }

    public void Add(Reservation reservation) => db.Reservations.Add(reservation);
}