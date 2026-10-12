using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Domain.Enums
{
    public enum MovementReason
    {
        Consumption,
        Shipment,
        Loss,
        InventoryCorrection,
        Other
    }
}
