using System;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;

namespace HrSystem.Application.Services;

public class NotificationService : INotificationService
{
    private readonly HrDbContext _dbContext;

    public NotificationService(HrDbContext dbContext)
    {
        _dbContext = dbContext;
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

        _dbContext.Notifications.Add(notification);
        // Note: The caller (e.g. CardService, CommentService) handles SaveChangesAsync 
        // to ensure the notification is saved in the same transaction. 
        // Or wait, if we want this to be simple, we can just save it here. 
        // The implementation spec says "called synchronously within the same transaction/unit-of-work as the triggering action".
        // Actually, if it's in the same transaction, DbContext tracks it, but if the caller already calls SaveChangesAsync, we don't strictly need it here.
        // But to be safe if a caller doesn't call SaveChangesAsync after NotifyAsync, we can just let the caller handle it.
        // Wait, looking at TaskCardService.PatchCardAsync, it calls SaveChangesAsync at the end.
        // If we want it to be part of the caller's transaction, we should just Add and NOT call SaveChangesAsync here.
        // Or we can call SaveChangesAsync here if we want to ensure it's saved. But if it's called BEFORE the caller's SaveChangesAsync, it will save everything up to this point.
        // To strictly be part of the same transaction without intermediate saves, let's just NOT call SaveChangesAsync here. Wait, what about EmailService?
        // Actually, it's safer to just call await _dbContext.SaveChangesAsync() here, or leave it to the caller. 
        // "called synchronously within the same transaction/unit-of-work as the triggering action" -> I will just let the caller do SaveChangesAsync. Wait, the spec example:
        // if (...) { await _notificationService.NotifyAsync(...); }
        // If the caller already did SaveChangesAsync (like in CardService.UpdateCardAsync example the spec says "after saving the card change"), then we MUST call SaveChangesAsync here.
        // Let's call SaveChangesAsync here to be safe and independent.

        await _dbContext.SaveChangesAsync();
    }
}
