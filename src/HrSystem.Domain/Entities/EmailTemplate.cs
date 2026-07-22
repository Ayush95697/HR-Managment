using System;
using System.Collections.Generic;

namespace HrSystem.Domain.Entities;

public class EmailTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string PlaceholderSchemaJson { get; set; } = "{}";

    public ICollection<EmailLog> Logs { get; set; } = new List<EmailLog>();
}
