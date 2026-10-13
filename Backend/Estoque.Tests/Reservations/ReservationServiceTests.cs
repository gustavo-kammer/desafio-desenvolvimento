using Estoque.Application.Abstractions;
using Estoque.Application.Reservations;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Tests.Reservations;

public class ReservationServiceTests
{
    private const int UserId = 7;

    private readonly IProductRepository _products = Substitute.For<IProductRepository>();
    private readonly IReservationRepository _reservations = Substitute.For<IReservationRepository>();
    private readonly IStockMovementRepository _movements = Substitute.For<IStockMovementRepository>();
    private readonly ICurrentUser _currentUser = Substitute.For<ICurrentUser>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly ReservationService _sut;

    private StockMovement? _addedMovement;

    public ReservationServiceTests()
    {
        _currentUser.Id.Returns(UserId);
        _movements.When(m => m.Add(Arg.Any<StockMovement>()))
            .Do(call => _addedMovement = call.Arg<StockMovement>());

        _sut = new ReservationService(_products, _reservations, _movements, _currentUser, _unitOfWork);
    }

    private Product GivenProduct(decimal total, decimal reserved = 0)
    {
        var product = new Product(1, "FR-001", "Frita transparente", UnitOfMeasure.Kg);
        product.Stock.Add(total);
        if (reserved > 0)
            product.Stock.Reserve(reserved);

        _products.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(product);
        return product;
    }

    private Reservation GivenReservation(decimal quantity)
    {
        var reservation = new Reservation(1, quantity, UserId);
        _reservations.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(reservation);
        return reservation;
    }

    [Fact]
    public async Task CreateAsync_ReservesStockAndRegistersMovement()
    {
        var product = GivenProduct(total: 10m);

        var dto = await _sut.CreateAsync(new CreateReservationRequest(1, 4m));

        Assert.Equal(4m, product.Stock.ReservedQuantity);
        Assert.Equal(6m, product.Stock.AvailableQuantity);
        Assert.Equal(ReservationStatus.Active, dto.Status);
        Assert.NotNull(_addedMovement);
        Assert.Equal(MovementType.Reservation, _addedMovement.Type);
        Assert.Equal(UserId, _addedMovement.UserId);
        Assert.NotNull(_addedMovement.Reservation);
        _reservations.Received(1).Add(Arg.Any<Reservation>());
        await _unitOfWork.Received(1).CommitAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_QuantityAboveAvailable_ThrowsAndSavesNothing()
    {
        GivenProduct(total: 10m, reserved: 8m);

        await Assert.ThrowsAsync<InsufficientStockException>(
            () => _sut.CreateAsync(new CreateReservationRequest(1, 3m)));

        _reservations.DidNotReceive().Add(Arg.Any<Reservation>());
        _movements.DidNotReceive().Add(Arg.Any<StockMovement>());
        await _unitOfWork.DidNotReceive().CommitAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CancelAsync_ReleasesReservedQuantityAndClosesReservation()
    {
        var product = GivenProduct(total: 10m, reserved: 4m);
        var reservation = GivenReservation(4m);

        var dto = await _sut.CancelAsync(1);

        Assert.Equal(0m, product.Stock.ReservedQuantity);
        Assert.Equal(10m, product.Stock.TotalQuantity);
        Assert.Equal(ReservationStatus.Canceled, dto.Status);
        Assert.Equal(UserId, reservation.ClosedById);
        Assert.Equal(MovementType.ReservationCancellation, _addedMovement!.Type);
    }

    [Fact]
    public async Task ConsumeAsync_RemovesFromTotalAndReserved()
    {
        var product = GivenProduct(total: 10m, reserved: 4m);
        GivenReservation(4m);

        var dto = await _sut.ConsumeAsync(1);

        Assert.Equal(6m, product.Stock.TotalQuantity);
        Assert.Equal(0m, product.Stock.ReservedQuantity);
        Assert.Equal(ReservationStatus.Consumed, dto.Status);
        Assert.Equal(MovementType.ReservationConsumption, _addedMovement!.Type);
    }

    [Fact]
    public async Task CancelAsync_AlreadyClosedReservation_ThrowsAndLeavesStockUntouched()
    {
        var product = GivenProduct(total: 10m, reserved: 4m);
        var reservation = GivenReservation(4m);
        reservation.Cancel(UserId);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => _sut.CancelAsync(1));

        Assert.Equal(ErrorCodes.ReservationNotActive, ex.ErrorCode);
        Assert.Equal(4m, product.Stock.ReservedQuantity);
        _movements.DidNotReceive().Add(Arg.Any<StockMovement>());
    }
}