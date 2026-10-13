namespace Estoque.Application.Reservations;

public interface IReservationService
{
    Task<ReservationDto> CreateAsync(CreateReservationRequest request, CancellationToken ct = default);
    Task<ReservationDto> CancelAsync(int reservationId, CancellationToken ct = default);
    Task<ReservationDto> ConsumeAsync(int reservationId, CancellationToken ct = default);
}