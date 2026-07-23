using System;
using System.Collections.Generic;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.DTOs;

public record TaskCardDto(
    Guid Id,
    Guid BoardId,
    Guid ColumnId,
    string ColumnName,
    Guid? AssignedToId,
    string? AssignedToName,
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    Guid CreatedById,
    string CreatedByName,
    double Position,
    byte[] RowVersion,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record TaskCardDetailDto(
    Guid Id,
    Guid BoardId,
    Guid ColumnId,
    string ColumnName,
    Guid? AssignedToId,
    string? AssignedToName,
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    Guid CreatedById,
    string CreatedByName,
    double Position,
    byte[] RowVersion,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<TaskCommentDto> Comments,
    List<TaskAttachmentDto> Attachments
);

public record CreateTaskCardRequest(
    Guid ColumnId,
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    Guid? AssignedToId
);

/// <summary>
/// PATCH request for task cards. All fields are optional.
/// To unassign a card, set ClearAssignee = true (AssignedToId is then ignored).
/// </summary>
public record PatchTaskCardRequest(
    Guid? ColumnId,
    string? Title,
    string? Description,
    TaskPriority? Priority,
    DateTime? DueDate,
    Guid? AssignedToId,
    bool? ClearAssignee,    // BUG-09 FIX: set true to explicitly unassign the card
    double? Position,
    byte[] RowVersion
);

public record TaskCommentDto(
    Guid Id,
    Guid TaskCardId,
    Guid AuthorId,
    string AuthorName,
    string Body,
    DateTime CreatedAt
);

public record CreateCommentRequest(string Body);

public record TaskAttachmentDto(
    Guid Id,
    Guid TaskCardId,
    string FileName,
    string FileUrl,
    Guid UploadedById,
    string UploadedByName,
    DateTime UploadedAt
);

public record TaskActivityLogDto(
    Guid Id,
    Guid TaskCardId,
    Guid ActorId,
    string ActorName,
    string ActorRole,
    Guid? FromColumnId,
    string? FromColumnName,
    Guid? ToColumnId,
    string? ToColumnName,
    TaskActivityAction Action,
    DateTime Timestamp,
    string? MetadataJson
);
