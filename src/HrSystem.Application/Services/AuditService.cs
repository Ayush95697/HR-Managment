using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Application.Services;

public class AuditService : IAuditService
{
    private readonly HrDbContext _dbContext;

    public AuditService(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<TaskActivityLogDto>> GetAuditLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var query = _dbContext.TaskActivityLogs
            .Include(al => al.Actor)
                .ThenInclude(a => a.Role)
            .Include(al => al.FromColumn)
            .Include(al => al.ToColumn)
            .Include(al => al.TaskCard)
                .ThenInclude(tc => tc.Board)
            .AsQueryable();

        // BUG-10 FIX: AuditController is restricted to HR and Admin only at the controller level.
        // The Employee branch below was dead code (employees can never reach this service method).
        // Keeping only the HR department scope filter.
        if (currentUserRole == RoleType.HR.ToString())
        {
            query = query.Where(al => al.TaskCard.Board.DepartmentId == currentUserDeptId);
        }
        // Admin sees all logs — no filter needed.

        return await query
            .OrderByDescending(al => al.Timestamp)
            .Select(al => new TaskActivityLogDto(
                al.Id,
                al.TaskCardId,
                al.ActorId,
                al.Actor.Name,
                al.Actor.Role.Name,
                al.FromColumnId,
                al.FromColumn != null ? al.FromColumn.Name : null,
                al.ToColumnId,
                al.ToColumn != null ? al.ToColumn.Name : null,
                al.Action,
                al.Timestamp,
                al.MetadataJson
            ))
            .ToListAsync();
    }
}
