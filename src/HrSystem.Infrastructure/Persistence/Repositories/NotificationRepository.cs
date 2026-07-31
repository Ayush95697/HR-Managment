using System.Threading.Tasks;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using HrSystem.Infrastructure.Persistence;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly HrDbContext _dbContext;

    public NotificationRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task AddAsync(Notification notification)
    {
        _dbContext.Notifications.Add(notification);
        return Task.CompletedTask;
    }

    public async Task<(List<Notification> Items, int TotalCount)> GetUnreadNotificationsAsync(Guid userId, int page, int pageSize)
    {
        var query = _dbContext.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _dbContext.Notifications
            .CountAsync(n => n.RecipientId == userId && !n.IsRead);
    }

    public async Task<Notification?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Notifications
            .FirstOrDefaultAsync(n => n.Id == id);
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _dbContext.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
