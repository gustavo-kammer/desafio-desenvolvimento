using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Domain.Exceptions
{
    public class ConflictException(string message) : AppException(message, "conflict");
}
