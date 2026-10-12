using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Domain.Exceptions
{
    public class NotFoundException(string message) : AppException(message, "not_found");
}
