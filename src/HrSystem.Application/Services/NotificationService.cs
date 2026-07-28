using System;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
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
    }
}
