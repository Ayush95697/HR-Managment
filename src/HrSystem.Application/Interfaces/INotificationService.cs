using System;
using System.Threading.Tasks;

using HrSystem.Domain.Enums;

namespace HrSystem.Application.Interfaces;

public interface INotificationService
{
    Task NotifyAsync(Guid recipientId, Guid? actorId, NotificationType type, string message, Guid? taskCardId = null, Guid? boardId = null);
    Task<HrSystem.Application.DTOs.PaginatedList<HrSystem.Application.DTOs.NotificationDto>> GetNotificationsAsync(Guid userId, int page, int pageSize);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid id, Guid currentUserId);
    Task MarkAllAsReadAsync(Guid currentUserId);
}