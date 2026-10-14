using Estoque.Application.Analytics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize]
public sealed class AnalyticsController(IAnalyticsService analytics) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<AnalyticsSummaryDto>> Summary(
        [FromQuery] int days = 30, [FromQuery] int utcOffsetMinutes = 0, CancellationToken ct = default) =>
        Ok(await analytics.GetSummaryAsync(days, utcOffsetMinutes, ct));
}
