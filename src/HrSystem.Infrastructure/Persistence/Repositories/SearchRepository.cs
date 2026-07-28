using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class SearchRepository : ISearchRepository
{
    private readonly HrDbContext _dbContext;

    public SearchRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<SearchTaskDto>> SearchTasksAsync(string query, bool isGlobalAdmin, Guid currentUserId, Guid? departmentId)
    {
        var taskQuery = _dbContext.TaskCards
            .Include(t => t.Board)
            .Include(t => t.Column)
            .AsNoTracking()
            .Where(t => t.Title.ToLower().Contains(query) || (t.Description != null && t.Description.ToLower().Contains(query)));

        if (!isGlobalAdmin)
        {
            if (departmentId.HasValue)
            {
                taskQuery = taskQuery.Where(t => t.Board.DepartmentId == departmentId.Value);
            }
            else
            {
                taskQuery = taskQuery.Where(t => t.CreatedById == currentUserId || t.AssignedToId == currentUserId);
            }
        }

        return await taskQuery
            .OrderByDescending(t => t.CreatedAt)
            .Take(10)
            .Select(t => new SearchTaskDto
            {
                Id = t.Id,
                BoardId = t.BoardId,
                Title = t.Title,
                BoardName = t.Board.Name,
                Status = t.Column.Name
            })
            .ToListAsync();
    }

    public async Task<List<SearchEmployeeDto>> SearchEmployeesAsync(string query, bool isGlobalAdmin, Guid currentUserId, Guid? departmentId)
    {
        var empQuery = _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .Include(u => u.Manager)
            .AsNoTracking()
            .Where(u => u.Name.ToLower().Contains(query) || u.Email.ToLower().Contains(query));

        if (!isGlobalAdmin)
        {
            if (departmentId.HasValue)
            {
                empQuery = empQuery.Where(u => u.DepartmentId == departmentId.Value);
            }
            else
            {
                empQuery = empQuery.Where(u => u.Id == currentUserId);
            }
        }

        return await empQuery
            .OrderBy(u => u.Name)
            .Take(10)
            .Select(u => new SearchEmployeeDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role.Name,
                DepartmentName = u.Department != null ? u.Department.Name : null,
                ManagerName = u.Manager != null ? u.Manager.Name : null,
                IsActive = u.IsActive,
                AvatarUrl = u.AvatarUrl
            })
            .ToListAsync();
    }

    public async Task<List<SearchDepartmentDto>> SearchDepartmentsAsync(string query, bool isGlobalAdmin, Guid? departmentId)
    {
        var deptQuery = _dbContext.Departments
            .AsNoTracking()
            .Where(d => d.Name.ToLower().Contains(query));

        if (!isGlobalAdmin)
        {
            if (departmentId.HasValue)
            {
                deptQuery = deptQuery.Where(d => d.Id == departmentId.Value);
            }
            else
            {
                deptQuery = deptQuery.Where(d => false);
            }
        }

        return await deptQuery
            .OrderBy(d => d.Name)
            .Take(10)
            .Select(d => new SearchDepartmentDto
            {
                Id = d.Id,
                Name = d.Name
            })
            .ToListAsync();
    }

    public async Task<List<SearchBoardDto>> SearchBoardsAsync(string query, bool isGlobalAdmin, Guid currentUserId, Guid? departmentId)
    {
        var boardQuery = _dbContext.Boards
            .Include(b => b.Department)
            .Include(b => b.Owner)
            .AsNoTracking()
            .Where(b => b.Name.ToLower().Contains(query));

        if (!isGlobalAdmin)
        {
            if (departmentId.HasValue)
            {
                boardQuery = boardQuery.Where(b => b.DepartmentId == departmentId.Value);
            }
            else
            {
                boardQuery = boardQuery.Where(b => b.OwnerId == currentUserId);
            }
        }

        return await boardQuery
            .OrderBy(b => b.Name)
            .Take(10)
            .Select(b => new SearchBoardDto
            {
                Id = b.Id,
                Name = b.Name,
                DepartmentName = b.Department != null ? b.Department.Name : null,
                OwnerName = b.Owner.Name
            })
            .ToListAsync();
    }
}
