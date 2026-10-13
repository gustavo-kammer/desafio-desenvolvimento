namespace Estoque.Domain.Exceptions;

public static class ErrorCodes
{
    public const string NotFound = "not_found";
    public const string Conflict = "conflict";
    public const string BusinessRule = "business_rule_violation";
    public const string InvalidQuantity = "invalid_quantity";
    public const string InvalidMinimumStock = "invalid_minimum_stock";
    public const string InsufficientStock = "insufficient_stock";
    public const string ReservedQuantityExceeded = "reserved_quantity_exceeded";
    public const string ReservationNotActive = "reservation_not_active";
    public const string ReservationRequired = "reservation_required";
    public const string AdjustmentRequiresJustification = "adjustment_requires_justification";
    public const string ProductHasStock = "product_has_stock";
    public const string ProductHasActiveReservations = "product_has_active_reservations";
    public const string InvalidCredentials = "invalid_credentials";
    public const string WeakPassword = "weak_password";
    public const string CannotChangeOwnAccess = "cannot_change_own_access";
}
