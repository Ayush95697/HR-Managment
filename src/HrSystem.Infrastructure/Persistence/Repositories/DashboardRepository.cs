using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly HrDbContext _dbContext;

    public DashboardRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Dictionary<DateTime, int>> GetTaskVelocityCountsAsync(int range, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var since = DateTime.UtcNow.Date.AddDays(-range);
        var query = _dbContext.TaskCards
            .Where(c => c.CompletedAt != null && c.CompletedAt >= since);

        if (currentUserRole == RoleType.HR.ToString())
        {
            query = query.Where(c => c.Board.DepartmentId == currentUserDeptId);
        }

        var dbResults = await query
            .GroupBy(c => c.CompletedAt!.Value.Date)
            .Select(g => new { Bucket = g.Key, Count = g.Count() })
            .ToListAsync();

        return dbResults.ToDictionary(r => r.Bucket, r => r.Count);
    }

    public async Task<List<DepartmentDistributionDto>> GetDepartmentDistributionAsync()
    {
        return await _dbContext.Departments
            .Select(d => new DepartmentDistributionDto(
                d.Name,
                d.Users.Count(u => u.IsActive)
            ))
            .ToListAsync();
    }

    public async Task<List<WorkloadBalanceDto>> GetWorkloadBalanceAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var query = _dbContext.TaskCards
            .Include(c => c.AssignedTo)
            .Where(c => c.CompletedAt == null 
                     && c.AssignedToId != null 
                     && c.AssignedTo != null 
                     && (c.Priority == TaskPriority.High || c.Priority == TaskPriority.Critical));

        if (currentUserRole == RoleType.HR.ToString())
        {
            query = query.Where(c => c.Board.DepartmentId == currentUserDeptId);
        }

        var cards = await query.ToListAsync();

        return cards
            .GroupBy(c => new { UserId = c.AssignedToId!.Value, UserName = c.AssignedTo!.Name })
            .Select(g => new WorkloadBalanceDto(
                g.Key.UserId,
                g.Key.UserName,
                g.Count(c => c.Priority == TaskPriority.High),
                g.Count(c => c.Priority == TaskPriority.Critical)
            ))
            .OrderByDescending(g => g.Critical).ThenByDescending(g => g.High)
            .ToList();
    }

    public async Task<List<ActivityFeedItemDto>> GetTaskActivityFeedAsync(int page, int pageSize, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var taskQuery = _dbContext.TaskActivityLogs
            .Include(l => l.Actor)
            .Include(l => l.TaskCard)
            .Include(l => l.ToColumn)
            .AsQueryable();

        if (currentUserRole == RoleType.HR.ToString())
        {
            taskQuery = taskQuery.Where(l => l.TaskCard != null && l.TaskCard.Board.DepartmentId == currentUserDeptId);
        }

        return await taskQuery
            .OrderByDescending(l => l.Timestamp)
            .Take(pageSize * 2)
            .Select(l => new ActivityFeedItemDto
            {
                Id = l.Id,
                Timestamp = l.Timestamp,
                Message = BuildTaskEventMessage(l),
                Kind = "TaskActivity"
            })
            .ToListAsync();
    }

    public async Task<List<ActivityFeedItemDto>> GetOnboardingFeedAsync(int page, int pageSize, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var userQuery = _dbContext.Users
            .Include(u => u.Department)
            .Where(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30));

        if (currentUserRole == RoleType.HR.ToString())
        {
            userQuery = userQuery.Where(u => u.DepartmentId == currentUserDeptId);
        }

        return await userQuery
            .OrderByDescending(u => u.CreatedAt)
            .Take(pageSize * 2)
            .Select(u => new ActivityFeedItemDto
            {
                Id = u.Id,
                Timestamp = u.CreatedAt,
                Message = $"New user onboarded: {u.Name} joined {(u.Department != null ? u.Department.Name : "the organization")}",
                Kind = "Onboarding"
            })
            .ToListAsync();
    }

    private static string BuildTaskEventMessage(TaskActivityLog log)
    {
        string actor = log.Actor?.Name ?? "Someone";
        string title = log.TaskCard?.Title ?? "a task";

        return log.Action switch
        {
            TaskActivityAction.Created => $"{actor} created task '{title}'",
            TaskActivityAction.Moved => $"{actor} moved '{title}' to {log.ToColumn?.Name ?? "another column"}",
            TaskActivityAction.Commented => $"{actor} commented on '{title}'",
            TaskActivityAction.Assigned => $"{actor} assigned '{title}'",
            TaskActivityAction.Edited => $"{actor} edited '{title}'",
            _ => $"{actor} updated '{title}'",
        };
    }
}
