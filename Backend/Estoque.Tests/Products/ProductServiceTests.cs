using Estoque.Application.Products;
using Estoque.Domain.Entities;
using Estoque.Domain.Enums;
using Estoque.Domain.Exceptions;
using Estoque.Domain.Repositories;
using NSubstitute;

namespace Estoque.Tests.Products;

public class ProductServiceTests
{
    private readonly IProductRepository _products = Substitute.For<IProductRepository>();
    private readonly IProductCategoryRepository _categories = Substitute.For<IProductCategoryRepository>();
    private readonly IReservationRepository _reservations = Substitute.For<IReservationRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly ProductService _sut;

    public ProductServiceTests()
    {
        _categories.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(new ProductCategory("Fritas e esmaltes"));

        _sut = new ProductService(_products, _categories, _reservations, _unitOfWork);
    }

    private Product GivenExistingProduct(decimal stock = 0)
    {
        var product = new Product(1, "FR-001", "Frita transparente", UnitOfMeasure.Kg);
        if (stock > 0)
            product.Stock.Add(stock);

        _products.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(product);
        return product;
    }

    [Fact]
    public async Task CreateAsync_NormalizesCodeAndCommits()
    {
        Product? added = null;
        _products.When(p => p.Add(Arg.Any<Product>())).Do(c => added = c.Arg<Product>());

        var dto = await _sut.CreateAsync(
            new CreateProductRequest(1, "  fr-001 ", "Frita transparente", UnitOfMeasure.Kg));

        Assert.Equal("FR-001", dto.Code);
        Assert.NotNull(added);
        await _unitOfWork.Received(1).CommitAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_DuplicateCode_ThrowsConflict()
    {
        _products.CodeExistsAsync("FR-001", Arg.Any<CancellationToken>()).Returns(true);

        await Assert.ThrowsAsync<ConflictException>(() => _sut.CreateAsync(
            new CreateProductRequest(1, "fr-001", "Frita", UnitOfMeasure.Kg)));

        _products.DidNotReceive().Add(Arg.Any<Product>());
    }

    [Fact]
    public async Task CreateAsync_UnknownCategory_ThrowsNotFound()
    {
        _categories.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns((ProductCategory?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.CreateAsync(
            new CreateProductRequest(99, "FR-001", "Frita", UnitOfMeasure.Kg)));
    }

    [Fact]
    public async Task ArchiveAsync_WithStock_Throws()
    {
        var product = GivenExistingProduct(stock: 5m);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => _sut.ArchiveAsync(1));

        Assert.Equal(ErrorCodes.ProductHasStock, ex.ErrorCode);
        Assert.False(product.IsArchived);
    }

    [Fact]
    public async Task ArchiveAsync_WithActiveReservation_Throws()
    {
        var product = GivenExistingProduct();
        _reservations.HasActiveForProductAsync(Arg.Any<int>(), Arg.Any<CancellationToken>()).Returns(true);

        var ex = await Assert.ThrowsAsync<BusinessRuleException>(() => _sut.ArchiveAsync(1));

        Assert.Equal(ErrorCodes.ProductHasActiveReservations, ex.ErrorCode);
        Assert.False(product.IsArchived);
    }

    [Fact]
    public async Task ArchiveAsync_NoStockNoReservations_ArchivesAndCommits()
    {
        var product = GivenExistingProduct();

        await _sut.ArchiveAsync(1);

        Assert.True(product.IsArchived);
        await _unitOfWork.Received(1).CommitAsync(Arg.Any<CancellationToken>());
    }
}