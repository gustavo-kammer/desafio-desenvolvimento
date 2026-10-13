using Estoque.Application.Abstractions;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Reservations;

public sealed class ReservationService(
    IProductRepository products,
    IReservationRepository reservations,
    IStockMovementRepository movements,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork) : IReservationService
{
    public async Task<ReservationDto> CreateAsync(CreateReservationRequest request, CancellationToken ct = default)
    {
        var product = await GetProductAsync(request.ProductId, ct);
        product.EnsureQuantityIsValid(request.Quantity);

        var reservation = new Reservation(product.Id, request.Quantity, currentUser.Id);

        RegisterMovement(MovementType.Reservation, product.Stock, reservation, product.Stock.Reserve);
        reservations.Add(reservation);

        await unitOfWork.CommitAsync(ct);
        return await ToDtoAsync(reservation, ct);
    }

    public Task<ReservationDto> CancelAsync(int reservationId, CancellationToken ct = default) =>
        CloseAsync(reservationId, MovementType.ReservationCancellation,
            (reservation, userId) => reservation.Cancel(userId),
            stock => stock.ReleaseReservation, ct);

    public Task<ReservationDto> ConsumeAsync(int reservationId, CancellationToken ct = default) =>
        CloseAsync(reservationId, MovementType.ReservationConsumption,
            (reservation, userId) => reservation.Consume(userId),
            stock => stock.ConsumeReservation, ct);

    private async Task<ReservationDto> CloseAsync(
        int reservationId,
        MovementType type,
        Action<Reservation, int> close,
        Func<Stock, Action<decimal>> stockOperation,
        CancellationToken ct)
    {
        var reservation = await reservations.GetByIdAsync(reservationId, ct)
            ?? throw new NotFoundException($"Reserva {reservationId} não encontrada.");
        var product = await GetProductAsync(reservation.ProductId, ct);

        close(reservation, currentUser.Id);
        RegisterMovement(type, product.Stock, reservation, stockOperation(product.Stock));

        await unitOfWork.CommitAsync(ct);
        return await ToDtoAsync(reservation, ct);
    }

    private void RegisterMovement(MovementType type, Stock stock, Reservation reservation, Action<decimal> apply)
    {
        var quantity = reservation.Quantity;
        var totalBefore = stock.TotalQuantity;
        var reservedBefore = stock.ReservedQuantity;

        apply(quantity);

        movements.Add(new StockMovement(
            reservation.ProductId, type, quantity, currentUser.Id,
            totalBefore, stock.TotalQuantity,
            reservedBefore, stock.ReservedQuantity,
            reservation: reservation));
    }

    public async Task<IReadOnlyList<ReservationDto>> ListAsync(
        ReservationStatus? status, int? productId, CancellationToken ct = default) =>
        (await reservations.ListAsync(status, productId, ct)).Select(ReservationDto.From).ToList();

    private async Task<Product> GetProductAsync(int productId, CancellationToken ct) =>
        await products.GetByIdAsync(productId, ct)
            ?? throw new NotFoundException($"Produto {productId} não encontrado.");

    private async Task<ReservationDto> ToDtoAsync(Reservation reservation, CancellationToken ct) =>
        ReservationDto.From(await reservations.GetDetailedAsync(reservation.Id, ct) ?? reservation);
}