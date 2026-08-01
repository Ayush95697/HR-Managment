using System;
using System.Threading.Tasks;

using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    Task<(System.Collections.Generic.List<Notification> Items, int TotalCount)> GetUnreadNotificationsAsync(Guid userId, int page, int pageSize);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task<Notification?> GetByIdAsync(Guid id);
    Task MarkAllAsReadAsync(Guid userId);
    Task SaveChangesAsync();
}