using Estoque.API.Security;
using Estoque.Application.Movements;
using Estoque.Domain.Common;
using Estoque.Domain.Enums;
using Estoque.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/stock")]
public sealed class StockController(IStockMovementService movements) : ControllerBase
{
    [HttpPost("entries")]
    [Authorize(Policy = Policies.OperateStock)]
    public Task<ActionResult<StockMovementDto>> Entry(MovementRequest request, CancellationToken ct) =>
        Register(MovementType.Entry, request, ct);

    [HttpPost("exits")]
    [Authorize(Policy = Policies.OperateStock)]
    public Task<ActionResult<StockMovementDto>> Exit(MovementRequest request, CancellationToken ct) =>
        Register(MovementType.Exit, request, ct);


    [HttpPost("adjustments/increase")]
    [Authorize(Policy = Policies.AdjustStock)]
    public Task<ActionResult<StockMovementDto>> IncreaseAdjustment(MovementRequest request, CancellationToken ct) =>
        Register(MovementType.AdjustmentIn, request, ct);

    [HttpPost("adjustments/decrease")]
    [Authorize(Policy = Policies.AdjustStock)]
    public Task<ActionResult<StockMovementDto>> DecreaseAdjustment(MovementRequest request, CancellationToken ct) =>
        Register(MovementType.AdjustmentOut, request, ct);

    [HttpGet("movements")]
    public async Task<ActionResult<PagedResult<StockMovementDto>>> History(
        [FromQuery] StockMovementFilter filter, CancellationToken ct) =>
        Ok(await movements.ListAsync(filter, ct));

    private async Task<ActionResult<StockMovementDto>> Register(
        MovementType type, MovementRequest request, CancellationToken ct)
    {
        var movement = await movements.RegisterAsync(type, request, ct);
        return StatusCode(StatusCodes.Status201Created, movement);
    }
}