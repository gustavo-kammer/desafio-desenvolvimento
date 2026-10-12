using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Domain.Entities
{
    public class StockMovement
    {
        private StockMovement() { }

        public StockMovement(
            int productId, MovementType type, decimal quantity, int userId, decimal totalBefore, 
            decimal totalAfter, decimal reservedBefore, decimal reservedAfter, 
            int? reservationId = null, MovementReason? reason = null, 
            string? justification = null, string? referenceDocument = null)
        {
            if (quantity <= 0)
                throw new BusinessRuleException("A quantidade deve ser maior que zero.", "invalid_quantity");

            var isAdjustment = type is MovementType.AdjustmentIn or MovementType.AdjustmentOut;
            if (isAdjustment && (reason is null || string.IsNullOrWhiteSpace(justification)))
                throw new BusinessRuleException(
                    "Ajuste manual exige motivo e justificativa.", "adjustment_requires_justification");

            var isReservation = type is MovementType.Reservation
                or MovementType.ReservationCancellation
                or MovementType.ReservationConsumption;
            if (isReservation && reservationId is null)
                throw new BusinessRuleException(
                    "Movimentação de reserva exige a reserva associada.", "reservation_required");

            ProductId = productId;
            ReservationId = reservationId;
            Type = type;
            Quantity = quantity;
            TotalBefore = totalBefore;
            TotalAfter = totalAfter;
            ReservedBefore = reservedBefore;
            ReservedAfter = reservedAfter;
            Reason = reason;
            Justification = justification?.Trim();
            ReferenceDocument = referenceDocument?.Trim();
            UserId = userId;
            OccurredAt = DateTime.UtcNow;
        }

        public int Id { get; private set; }
        public int ProductId { get; private set; }
        public int? ReservationId { get; private set; }
        public MovementType Type { get; private set; }
        public decimal Quantity { get; private set; }
        public decimal TotalBefore { get; private set; }
        public decimal TotalAfter { get; private set; }
        public decimal ReservedBefore { get; private set; }
        public decimal ReservedAfter { get; private set; }
        public MovementReason? Reason { get; private set; }
        public string? Justification { get; private set; }
        public string? ReferenceDocument { get; private set; }
        public int UserId { get; private set; }
        public DateTime OccurredAt { get; private set; }

        public Product Product { get; private set; } = null!;
        public Reservation? Reservation { get; private set; }
        public User User { get; private set; } = null!;

    }
}
