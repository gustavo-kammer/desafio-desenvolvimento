using Estoque.Domain.Entities;

namespace Estoque.Domain.Repositories;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> HasActiveForProductAsync(int productId, CancellationToken ct = default);
    void Add(Reservation reservation);
}
