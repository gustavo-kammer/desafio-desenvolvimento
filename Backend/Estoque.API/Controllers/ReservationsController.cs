using Estoque.API.Security;
using Estoque.Application.Reservations;
using Estoque.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/reservations")]
public sealed class ReservationsController(IReservationService reservations) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<ReservationDto>>> List(
        [FromQuery] ReservationStatus? status, [FromQuery] int? productId, CancellationToken ct) =>
        Ok(await reservations.ListAsync(status, productId, ct));

    [HttpPost]
    [Authorize(Policy = Policies.OperateStock)]
    public async Task<ActionResult<ReservationDto>> Create(CreateReservationRequest request, CancellationToken ct) =>
        StatusCode(StatusCodes.Status201Created, await reservations.CreateAsync(request, ct));

    [HttpPost("{id:int}/cancel")]
    [Authorize(Policy = Policies.OperateStock)]
    public async Task<ActionResult<ReservationDto>> Cancel(int id, CancellationToken ct) =>
        Ok(await reservations.CancelAsync(id, ct));

    [HttpPost("{id:int}/consume")]
    [Authorize(Policy = Policies.OperateStock)]
    public async Task<ActionResult<ReservationDto>> Consume(int id, CancellationToken ct) =>
        Ok(await reservations.ConsumeAsync(id, ct));
}