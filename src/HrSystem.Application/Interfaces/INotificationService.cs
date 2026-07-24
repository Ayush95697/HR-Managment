using System;
using System.Threading.Tasks;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.Interfaces;

public interface INotificationService
{
    Task NotifyAsync(Guid recipientId, Guid? actorId, NotificationType type, string message, Guid? taskCardId = null, Guid? boardId = null);
}
