using Estoque.API.Security;
using Estoque.Application.Products;
using Estoque.Domain.Common;
using Estoque.Domain.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Estoque.API.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController(IProductService products) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> List([FromQuery] ProductFilter filter, CancellationToken ct) =>
        Ok(await products.ListAsync(filter, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken ct) =>
        Ok(await products.GetAsync(id, ct));

    [HttpPost]
    [Authorize(Policy = Policies.ManageProducts)]
    public async Task<ActionResult<ProductDto>> Create(CreateProductRequest request, CancellationToken ct)
    {
        var product = await products.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.ManageProducts)]
    public async Task<ActionResult<ProductDto>> Update(int id, UpdateProductRequest request, CancellationToken ct) =>
        Ok(await products.UpdateAsync(id, request, ct));

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Policies.ManageProducts)]
    public async Task<IActionResult> Archive(int id, CancellationToken ct)
    {
        await products.ArchiveAsync(id, ct);
        return NoContent();
    }
}