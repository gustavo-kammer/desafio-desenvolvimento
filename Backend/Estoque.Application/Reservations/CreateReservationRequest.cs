namespace Estoque.Application.Reservations;

public sealed record CreateReservationRequest(int ProductId, decimal Quantity);