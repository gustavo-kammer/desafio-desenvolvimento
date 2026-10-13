using Estoque.Domain.Common;
using Estoque.Domain.Entities;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;

namespace Estoque.Application.Products;

public sealed class ProductService(
    IProductRepository products,
    IProductCategoryRepository categories,
    IReservationRepository reservations,
    IUnitOfWork unitOfWork) : IProductService
{
    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        await EnsureCategoryExistsAsync(request.CategoryId, ct);

        var code = request.Code.Trim().ToUpperInvariant();
        if (await products.CodeExistsAsync(code, ct))
            throw new ConflictException($"Já existe um produto com o código '{code}'.");

        var product = new Product(
            request.CategoryId, code, request.Name, request.Unit, request.MinimumStock, request.Description);

        products.Add(product);
        await unitOfWork.CommitAsync(ct);

        return ProductDto.From(product);
    }

    public async Task<ProductDto> UpdateAsync(int id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await GetOrThrowAsync(id, ct);
        await EnsureCategoryExistsAsync(request.CategoryId, ct);

        product.Update(request.CategoryId, request.Name, request.Description, request.MinimumStock);
        await unitOfWork.CommitAsync(ct);

        return ProductDto.From(product);
    }

    public async Task ArchiveAsync(int id, CancellationToken ct = default)
    {
        var product = await GetOrThrowAsync(id, ct);

        if (product.Stock.TotalQuantity > 0)
            throw new BusinessRuleException(
                "Não é possível arquivar um produto com saldo em estoque.", ErrorCodes.ProductHasStock);

        if (await reservations.HasActiveForProductAsync(id, ct))
            throw new BusinessRuleException(
                "Não é possível arquivar um produto com reservas ativas.", ErrorCodes.ProductHasActiveReservations);

        product.Archive();
        await unitOfWork.CommitAsync(ct);
    }

    public async Task<ProductDto> GetAsync(int id, CancellationToken ct = default) =>
        ProductDto.From(await GetOrThrowAsync(id, ct));

    public async Task<PagedResult<ProductDto>> ListAsync(ProductFilter filter, CancellationToken ct = default)
    {
        var page = await products.ListAsync(filter, ct);
        return page.Map(ProductDto.From);
    }

    public async Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken ct = default)
    {
        var list = await categories.ListAsync(ct);
        return list.Select(CategoryDto.From).ToList();
    }

    public async Task<CategoryDto> CreateCategoryAsync(SaveCategoryRequest request, CancellationToken ct = default)
    {
        await EnsureCategoryNameIsFreeAsync(request.Name, null, ct);

        var category = new ProductCategory(request.Name, request.Description);
        categories.Add(category);
        await unitOfWork.CommitAsync(ct);

        return CategoryDto.From(category);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(int id, SaveCategoryRequest request, CancellationToken ct = default)
    {
        var category = await categories.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Categoria {id} não encontrada.");

        await EnsureCategoryNameIsFreeAsync(request.Name, id, ct);

        category.Update(request.Name, request.Description);
        await unitOfWork.CommitAsync(ct);

        return CategoryDto.From(category);
    }

    private async Task EnsureCategoryNameIsFreeAsync(string name, int? ignoreId, CancellationToken ct)
    {
        if (await categories.NameExistsAsync(name, ignoreId, ct))
            throw new ConflictException($"Já existe uma categoria com o nome '{name.Trim()}'.");
    }

    private async Task<Product> GetOrThrowAsync(int id, CancellationToken ct) =>
        await products.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Produto {id} não encontrado.");

    private async Task EnsureCategoryExistsAsync(int categoryId, CancellationToken ct)
    {
        if (await categories.GetByIdAsync(categoryId, ct) is null)
            throw new NotFoundException($"Categoria {categoryId} não encontrada.");
    }
}