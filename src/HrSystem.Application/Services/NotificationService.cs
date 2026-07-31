using System;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Application.DTOs;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Application.Exceptions;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace HrSystem.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly Microsoft.Extensions.Logging.ILogger<NotificationService> _logger;

    public NotificationService(INotificationRepository notificationRepository, Microsoft.Extensions.Logging.ILogger<NotificationService> logger)
    {
        _notificationRepository = notificationRepository;
        _logger = logger;
    }

    public async Task NotifyAsync(Guid recipientId, Guid? actorId, NotificationType type, string message, Guid? taskCardId = null, Guid? boardId = null)
    {
        // Guard against self-notification
        if (actorId.HasValue && actorId.Value == recipientId)
        {
            return;
        }

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            ActorId = actorId,
            Type = type,
            Message = message,
            TaskCardId = taskCardId,
            BoardId = boardId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);

        await _notificationRepository.SaveChangesAsync();

        _logger.LogInformation("Notification {NotificationId} created for User {RecipientId} of type {NotificationType}", notification.Id, recipientId, type);
    }

    public async Task<PaginatedList<NotificationDto>> GetNotificationsAsync(Guid userId, int page, int pageSize)
    {
        var (items, totalCount) = await _notificationRepository.GetUnreadNotificationsAsync(userId, page, pageSize);

        var dtos = items.Select(n => new NotificationDto(
            n.Id,
            n.Type,
            n.Message,
            n.TaskCardId,
            n.BoardId,
            n.IsRead,
            n.CreatedAt
        )).ToList();

        return new PaginatedList<NotificationDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId);
    }

    public async Task MarkAsReadAsync(Guid id, Guid currentUserId)
    {
        var notification = await _notificationRepository.GetByIdAsync(id);

        if (notification == null || notification.RecipientId != currentUserId)
        {
            throw new AppNotFoundException("Notification not found or access denied.");
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _notificationRepository.SaveChangesAsync();
            _logger.LogInformation("Notification {NotificationId} marked as read by user {UserId}", id, currentUserId);
        }
    }

    public async Task MarkAllAsReadAsync(Guid currentUserId)
    {
        await _notificationRepository.MarkAllAsReadAsync(currentUserId);
        _logger.LogInformation("All notifications marked as read for user {UserId}", currentUserId);
    }
}
