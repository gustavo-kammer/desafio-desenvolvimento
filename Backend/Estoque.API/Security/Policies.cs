namespace Estoque.API.Security;

public static class Policies
{
    public const string ManageUsers = nameof(ManageUsers);
    public const string ManageProducts = nameof(ManageProducts);
    public const string OperateStock = nameof(OperateStock);
    public const string AdjustStock = nameof(AdjustStock);
}