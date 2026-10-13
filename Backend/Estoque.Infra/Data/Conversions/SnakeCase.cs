using System.Text;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Estoque.Infra.Data.Conversions;

internal static class SnakeCase
{
    public static string From(string value)
    {
        var sb = new StringBuilder(value.Length + 4);
        for (var i = 0; i < value.Length; i++)
        {
            var c = value[i];
            if (char.IsUpper(c) && i > 0)
                sb.Append('_');
            sb.Append(char.ToLowerInvariant(c));
        }
        return sb.ToString();
    }

    public static string EnumIn<TEnum>(string column) where TEnum : struct, Enum =>
        $"{column} IN ({string.Join(", ", Enum.GetNames<TEnum>().Select(n => $"'{From(n)}'"))})";
}

internal sealed class SnakeCaseEnumConverter<TEnum>() : ValueConverter<TEnum, string>(
    value => SnakeCase.From(value.ToString()),
    text => Enum.Parse<TEnum>(text.Replace("_", ""), true))
    where TEnum : struct, Enum;