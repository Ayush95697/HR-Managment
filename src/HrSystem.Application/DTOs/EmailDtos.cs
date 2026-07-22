using System;
using System.Collections.Generic;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.DTOs;

public record EmailTemplateDto(
    Guid Id,
    string Name,
    string Subject,
    string BodyHtml,
    string PlaceholderSchemaJson
);

public record CreateEmailTemplateRequest(
    string Name,
    string Subject,
    string BodyHtml,
    string PlaceholderSchemaJson
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
