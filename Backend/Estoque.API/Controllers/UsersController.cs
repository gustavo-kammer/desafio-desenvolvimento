using Estoque.API.Security;
using Estoque.Application.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Policy = Policies.ManageUsers)]
public sealed class UsersController(IUserService users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDto>>> List(CancellationToken ct) =>
        Ok(await users.ListAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> Get(int id, CancellationToken ct) =>
        Ok(await users.GetAsync(id, ct));

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request, CancellationToken ct)
    {
        var user = await users.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserDto>> Update(int id, UpdateUserRequest request, CancellationToken ct) =>
        Ok(await users.UpdateAsync(id, request, ct));

    [HttpPut("{id:int}/password")]
    public async Task<IActionResult> ResetPassword(int id, ResetPasswordRequest request, CancellationToken ct)
    {
        await users.ResetPasswordAsync(id, request.NewPassword, ct);
        return NoContent();
    }

    [HttpPost("{id:int}/activate")]
    public async Task<ActionResult<UserDto>> Activate(int id, CancellationToken ct) =>
        Ok(await users.SetActiveAsync(id, true, ct));

    [HttpPost("{id:int}/deactivate")]
    public async Task<ActionResult<UserDto>> Deactivate(int id, CancellationToken ct) =>
        Ok(await users.SetActiveAsync(id, false, ct));
}