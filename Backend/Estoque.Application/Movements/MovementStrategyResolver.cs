using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;

namespace Estoque.Application.Movements;

public sealed class MovementStrategyResolver(IEnumerable<IMovementStrategy> strategies)
{
    private readonly Dictionary<MovementType, IMovementStrategy> _strategies = strategies.ToDictionary(s => s.Type);

    public IMovementStrategy Resolve(MovementType type) =>
        _strategies.TryGetValue(type, out var strategy)
            ? strategy
            : throw new BusinessRuleException($"Tipo de movimentação '{type}' não suportado.");
}