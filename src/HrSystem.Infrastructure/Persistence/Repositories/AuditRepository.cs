using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class AuditRepository : IAuditRepository
{
    private readonly HrDbContext _dbContext;

    public AuditRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<TaskActivityLog>> GetAuditLogsAsync(string currentUserRole, Guid? currentUserDeptId)
    {
        var query = _dbContext.TaskActivityLogs
            .Include(al => al.Actor)
                .ThenInclude(a => a.Role)
            .Include(al => al.FromColumn)
            .Include(al => al.ToColumn)
            .Include(al => al.TaskCard)
                .ThenInclude(tc => tc.Board)
            .AsQueryable();

        if (currentUserRole == RoleType.HR.ToString())
        {
            query = query.Where(al => al.TaskCard.Board.DepartmentId == currentUserDeptId);
        }

        return await query
            .OrderByDescending(al => al.Timestamp)
            .ToListAsync();
    }
}
