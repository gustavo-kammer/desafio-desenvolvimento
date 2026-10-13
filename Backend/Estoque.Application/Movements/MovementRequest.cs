using Estoque.Domain.Enums;

namespace Estoque.Application.Movements;

public sealed record MovementRequest(
    int ProductId,
    decimal Quantity,
    MovementReason? Reason = null,
    string? Justification = null,
    string? ReferenceDocument = null
    );
