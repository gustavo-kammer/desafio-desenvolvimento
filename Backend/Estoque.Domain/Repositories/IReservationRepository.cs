using Estoque.Domain.Entities;
using Estoque.Domain.Enums;

namespace Estoque.Domain.Repositories;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> HasActiveForProductAsync(int productId, CancellationToken ct = default);
    Task<IReadOnlyList<Reservation>> ListAsync(ReservationStatus? status, int? productId, CancellationToken ct = default);
    Task<Reservation?> GetDetailedAsync(int id, CancellationToken ct = default);
    void Add(Reservation reservation);
}
