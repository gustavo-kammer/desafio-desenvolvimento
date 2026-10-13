using Estoque.Application.Products;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(IProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> List(CancellationToken ct) =>
        Ok(await products.ListCategoriesAsync(ct));
}