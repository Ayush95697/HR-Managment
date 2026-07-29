using System.Threading.Tasks;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
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

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
