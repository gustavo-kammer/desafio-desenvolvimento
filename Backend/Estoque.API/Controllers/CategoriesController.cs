using Estoque.API.Security;
using Estoque.Application.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(IProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> List(CancellationToken ct) =>
        Ok(await products.ListCategoriesAsync(ct));

    [HttpPost]
    [Authorize(Policy = Policies.ManageProducts)]
    public async Task<ActionResult<CategoryDto>> Create(SaveCategoryRequest request, CancellationToken ct) =>
        StatusCode(StatusCodes.Status201Created, await products.CreateCategoryAsync(request, ct));

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.ManageProducts)]
    public async Task<ActionResult<CategoryDto>> Update(int id, SaveCategoryRequest request, CancellationToken ct) =>
        Ok(await products.UpdateCategoryAsync(id, request, ct));
}