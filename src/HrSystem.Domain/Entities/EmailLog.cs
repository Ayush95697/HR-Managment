using System;

using HrSystem.Domain.Enums;

namespace HrSystem.Domain.Entities;

public class EmailLog
{
    public Guid Id { get; set; }

    public Guid ToUserId { get; set; }
    public User ToUser { get; set; } = null!;

    public Guid TemplateId { get; set; }
    public EmailTemplate Template { get; set; } = null!;

    public Guid SentById { get; set; }
    public User SentBy { get; set; } = null!;

    public EmailLogStatus Status { get; set; } = EmailLogStatus.Queued;
    public string IdempotencyKey { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }

    public DateTime? QueuedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SentAt { get; set; }
}