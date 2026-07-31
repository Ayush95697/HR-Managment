using System.Collections.Generic;
using System.Text.RegularExpressions;
using HrSystem.Domain.Entities;

namespace HrSystem.Infrastructure.Email;

public class EmailTemplateRenderer : IEmailTemplateRenderer
{
    public (string subject, string bodyHtml) Render(EmailTemplate template, Dictionary<string, string>? values)
    {
        var ignoreCaseValues = values != null
            ? new Dictionary<string, string>(values, StringComparer.OrdinalIgnoreCase)
            : null;

        string Replace(string input) => Regex.Replace(input, @"\{\{(\w+)\}\}", m =>
            ignoreCaseValues != null && ignoreCaseValues.TryGetValue(m.Groups[1].Value, out var v) ? v : m.Value);

        return (Replace(template.Subject), Replace(template.BodyHtml));
    }
}
