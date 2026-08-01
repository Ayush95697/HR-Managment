using System.Collections.Generic;

using HrSystem.Domain.Entities;

namespace HrSystem.Infrastructure.Email;

public interface IEmailTemplateRenderer
{
    (string subject, string bodyHtml) Render(EmailTemplate template, Dictionary<string, string>? values);
}