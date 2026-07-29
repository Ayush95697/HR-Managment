using System;
using System.Threading.Tasks;
using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface INotificationRepository
{
    Task AddAsync(Notification notification);
    Task SaveChangesAsync();
}
