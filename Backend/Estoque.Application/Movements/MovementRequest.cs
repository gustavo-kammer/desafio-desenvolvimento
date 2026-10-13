using System.ComponentModel.DataAnnotations;
using Estoque.Domain.Enums;

namespace Estoque.Application.Movements;

public sealed record MovementRequest(
    int ProductId,
    decimal Quantity,
    MovementReason? Reason = null,
    [StringLength(500)] string? Justification = null,
    [StringLength(100)] string? ReferenceDocument = null);