using System;
using System.Collections.Generic;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.DTOs;

public record EmailTemplateDto(
    Guid Id,
    string Name,
    string Subject,
    string BodyHtml,
    Dictionary<string, string>? PlaceholderSchema,
    bool IsQuickAccess,
    Guid? CreatedByUserId
);

public record CreateEmailTemplateRequest(
    string Name,
    string Subject,
    string BodyHtml,
    Dictionary<string, string>? PlaceholderSchema
);

public record SendEmailRequest(
    Guid ToUserId,
    Guid TemplateId,
    string IdempotencyKey,
    Dictionary<string, string>? Placeholders
);

public record EmailLogDto(
    Guid Id,
    Guid ToUserId,
    string ToUserName,
    string ToUserEmail,
    Guid TemplateId,
    string TemplateName,
    Guid SentById,
    string SentByName,
    EmailLogStatus Status,
    string IdempotencyKey,
    string? ErrorMessage,
    DateTime? QueuedAt,
    DateTime? SentAt
);
