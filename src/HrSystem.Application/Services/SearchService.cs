using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Application.Services;

public class SearchService : ISearchService
{
    private readonly HrDbContext _dbContext;

    public SearchService(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GlobalSearchResultDto> GlobalSearchAsync(string query, Guid currentUserId, string role, Guid? departmentId)
    {
        var result = new GlobalSearchResultDto();

        if (string.IsNullOrWhiteSpace(query))
            return result;

        query = query.ToLower();
        bool isGlobalAdmin = role is "Admin" or "HR";

        // 1. Search Tasks
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
                // No department, can't see any tasks besides potentially ones they own, but let's strictly limit to none or assigned.
                // We'll restrict to ones they created or are assigned to if they don't have a department.
                taskQuery = taskQuery.Where(t => t.CreatedById == currentUserId || t.AssignedToId == currentUserId);
            }
        }

        var tasks = await taskQuery
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

        result.Tasks = tasks;

        // 2. Search Employees
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
                empQuery = empQuery.Where(u => u.Id == currentUserId); // Only see themselves
            }
        }

        var employees = await empQuery
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

        result.Employees = employees;

        // 3. Search Departments
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
                // Return no departments
                deptQuery = deptQuery.Where(d => false);
            }
        }

        var depts = await deptQuery
            .OrderBy(d => d.Name)
            .Take(10)
            .Select(d => new SearchDepartmentDto
            {
                Id = d.Id,
                Name = d.Name
            })
            .ToListAsync();

        result.Departments = depts;

        // 4. Search Boards
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

        var boards = await boardQuery
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

        result.Boards = boards;

        return result;
    }
}
