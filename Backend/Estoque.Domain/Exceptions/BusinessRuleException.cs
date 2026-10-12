using System;
using System.Collections.Generic;
using System.Text;

namespace Estoque.Domain.Exceptions
{
    public class BusinessRuleException(string message, string errorCode = "business_rule_violation") : AppException(message, errorCode);
}
