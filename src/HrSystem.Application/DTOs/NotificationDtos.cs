using System;
using System.Collections.Generic;

using HrSystem.Domain.Enums;

namespace HrSystem.Application.DTOs;

public record NotificationDto(
    Guid Id,
    NotificationType Type,
    string Message,
    Guid? TaskCardId,
    Guid? BoardId,
    bool IsRead,
    DateTime CreatedAt
);

public record PaginatedList<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize
);