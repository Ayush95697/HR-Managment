using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface ITaskCardRepository
{
    Task<List<TaskCard>> GetCardsByBoardIdAsync(Guid boardId);
    Task<TaskCard?> GetCardByIdWithDetailsAsync(Guid cardId);
    Task<TaskCard?> GetCardByIdAsync(Guid cardId);
    Task<TaskCard?> GetCardByIdWithBoardAndColumnAsync(Guid cardId);
    Task<double> GetMaxPositionAsync(Guid columnId);
    Task AddAsync(TaskCard card);
    Task AddActivityLogAsync(TaskActivityLog log);
    Task AddCommentAsync(TaskComment comment);
    Task DeleteAsync(TaskCard card);
    Task<bool> IsAssignedToBoardAsync(Guid boardId, Guid userId);
    Task<bool> IsAssignedToCardBoardAsync(Guid cardId, Guid userId);
    Task<List<TaskActivityLog>> GetActivityLogsByCardIdAsync(Guid cardId);
    Task<TaskCard> GetCardWithDetailsInternalAsync(Guid cardId);
    Task SaveChangesAsync();

    Task<List<TaskCard>> GetAssignedTasksAsync(Guid assignedToId, HrSystem.Application.Assistant.Capabilities.Queries.TaskQuery? query = null);
    Task<List<TaskCard>> GetCriticalTasksAsync(Guid? departmentId = null);
}