using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class TaskCardRepository : ITaskCardRepository
{
    private readonly HrDbContext _dbContext;

    public TaskCardRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<TaskCard>> GetCardsByBoardIdAsync(Guid boardId)
    {
        return await _dbContext.TaskCards
            .Include(c => c.Column)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .Where(c => c.BoardId == boardId)
            .OrderBy(c => c.Position)
            .ToListAsync();
    }

    public async Task<TaskCard?> GetCardByIdWithDetailsAsync(Guid cardId)
    {
        return await _dbContext.TaskCards
            .Include(c => c.Board)
            .Include(c => c.Column)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .Include(c => c.Comments)
                .ThenInclude(com => com.Author)
            .Include(c => c.Attachments)
                .ThenInclude(att => att.UploadedBy)
            .FirstOrDefaultAsync(c => c.Id == cardId);
    }

    public async Task<TaskCard?> GetCardByIdAsync(Guid cardId)
    {
        return await _dbContext.TaskCards.FirstOrDefaultAsync(c => c.Id == cardId);
    }

    public async Task<TaskCard?> GetCardByIdWithBoardAndColumnAsync(Guid cardId)
    {
        return await _dbContext.TaskCards
            .Include(c => c.Board)
            .Include(c => c.Column)
            .FirstOrDefaultAsync(c => c.Id == cardId);
    }

    public async Task<double> GetMaxPositionAsync(Guid columnId)
    {
        return await _dbContext.TaskCards
            .Where(c => c.ColumnId == columnId)
            .Select(c => (double?)c.Position)
            .MaxAsync() ?? 0.0;
    }

    public Task AddAsync(TaskCard card)
    {
        _dbContext.TaskCards.Add(card);
        return Task.CompletedTask;
    }

    public Task AddActivityLogAsync(TaskActivityLog log)
    {
        _dbContext.TaskActivityLogs.Add(log);
        return Task.CompletedTask;
    }

    public Task AddCommentAsync(TaskComment comment)
    {
        _dbContext.TaskComments.Add(comment);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(TaskCard card)
    {
        _dbContext.TaskCards.Remove(card);
        return Task.CompletedTask;
    }

    public async Task<bool> IsAssignedToBoardAsync(Guid boardId, Guid userId)
    {
        return await _dbContext.TaskCards.AnyAsync(c => c.BoardId == boardId && c.AssignedToId == userId);
    }

    public async Task<bool> IsAssignedToCardBoardAsync(Guid cardId, Guid userId)
    {
        var card = await _dbContext.TaskCards.FirstOrDefaultAsync(c => c.Id == cardId);
        if (card == null) return false;
        return await _dbContext.TaskCards.AnyAsync(c => c.BoardId == card.BoardId && c.AssignedToId == userId);
    }

    public async Task<List<TaskActivityLog>> GetActivityLogsByCardIdAsync(Guid cardId)
    {
        return await _dbContext.TaskActivityLogs
            .Include(al => al.Actor)
                .ThenInclude(a => a.Role)
            .Include(al => al.FromColumn)
            .Include(al => al.ToColumn)
            .Where(al => al.TaskCardId == cardId)
            .OrderByDescending(al => al.Timestamp)
            .ToListAsync();
    }

    public async Task<TaskCard> GetCardWithDetailsInternalAsync(Guid cardId)
    {
        return await _dbContext.TaskCards
            .Include(c => c.Column)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .FirstAsync(c => c.Id == cardId);
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<TaskCard>> GetAssignedTasksAsync(Guid assignedToId, HrSystem.Application.Assistant.Capabilities.Queries.TaskQuery? query = null)
    {
        var q = _dbContext.TaskCards
            .Include(c => c.Column)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .Where(c => c.AssignedToId == assignedToId && !c.Column.IsDoneColumn)
            .AsQueryable();

        if (query != null)
        {
            if (!string.IsNullOrEmpty(query.Priority) && Enum.TryParse<HrSystem.Domain.Enums.TaskPriority>(query.Priority, true, out var priority))
            {
                q = q.Where(c => c.Priority == priority);
            }
            if (query.BoardId.HasValue)
            {
                q = q.Where(c => c.BoardId == query.BoardId.Value);
            }
            if (query.DueDate == "Today")
            {
                var today = DateTime.UtcNow.Date;
                q = q.Where(c => c.DueDate.HasValue && c.DueDate.Value.Date == today);
            }
        }

        return await q.OrderBy(c => c.DueDate).ToListAsync();
    }

    public async Task<List<TaskCard>> GetCriticalTasksAsync(Guid? departmentId = null)
    {
        var query = _dbContext.TaskCards
            .Include(c => c.AssignedTo)
            .Include(c => c.Board)
            .Where(c => c.Priority == HrSystem.Domain.Enums.TaskPriority.Critical && !c.Column.IsDoneColumn);

        if (departmentId.HasValue)
        {
            query = query.Where(c => c.Board.DepartmentId == departmentId.Value);
        }

        return await query.ToListAsync();
    }
}
