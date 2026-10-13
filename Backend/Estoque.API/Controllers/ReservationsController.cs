using Estoque.API.Security;
using Estoque.Application.Reservations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/reservations")]
[Authorize(Policy = Policies.OperateStock)]
public sealed class ReservationsController(IReservationService reservations) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(CreateReservationRequest request, CancellationToken ct)
    {
        var reservation = await reservations.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, reservation);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ReservationDto>> Cancel(int id, CancellationToken ct) =>
        Ok(await reservations.CancelAsync(id, ct));

    [HttpPost("{id:int}/consume")]
    public async Task<ActionResult<ReservationDto>> Consume(int id, CancellationToken ct) =>
        Ok(await reservations.ConsumeAsync(id, ct));
}