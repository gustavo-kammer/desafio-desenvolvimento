using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Domain.Enums
{
    public enum MovementType
    {
        Entry,
        Exit,
        Reservation,
        ReservationCancellation,
        ReservationConsumption,
        AdjustmentIn,
        AdjustmentOut
    }
}
