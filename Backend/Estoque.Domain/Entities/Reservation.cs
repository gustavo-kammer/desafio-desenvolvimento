using Estoque.Domain.Common;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;

namespace Estoque.Domain.Entities;

public class Reservation
{
    private Reservation() { }

    public Reservation(int productId, decimal quantity, int createdById)
    {
        Guard.ValidQuantity(quantity);

        ProductId = productId;
        Quantity = quantity;
        CreatedById = createdById;
        Status = ReservationStatus.Active;
        CreatedAt = DateTime.UtcNow;
    }
    public int Id { get; private set; }
    public int ProductId { get; private set; }
    public decimal Quantity { get; private set; }
    public ReservationStatus Status { get; private set; }
    public int CreatedById { get; private set; }
    public int? ClosedById { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ClosedAt { get; private set; }

    public Product Product { get; private set; } = null!;
    public User CreatedBy { get; private set; } = null!;
    public User? ClosedBy { get; private set; }

    public bool IsActive => Status == ReservationStatus.Active;

    public void Cancel(int userId) => Close(ReservationStatus.Canceled, userId);
    public void Consume(int userId) => Close(ReservationStatus.Consumed, userId);

    private void Close(ReservationStatus newStatus, int userId)
    {
        if (!IsActive)
        {
            throw new BusinessRuleException($"A reserva {Id} já foi encerrada ({Status}).", ErrorCodes.ReservationNotActive);
        }

        Status = newStatus;
        ClosedById = userId;
        ClosedAt = DateTime.UtcNow;
    }
}
