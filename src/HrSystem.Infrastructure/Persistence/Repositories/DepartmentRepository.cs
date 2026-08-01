using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly HrDbContext _dbContext;

    public DepartmentRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _dbContext.Departments.AnyAsync(d => d.Id == id);
    }

    public async Task<List<Department>> GetAllAsync()
    {
        return await _dbContext.Departments.ToListAsync();
    }

    public async Task<Dictionary<Guid, int>> GetActiveUserCountsAsync()
    {
        return await _dbContext.Users
            .Where(u => u.IsActive && u.DepartmentId != null)
            .GroupBy(u => u.DepartmentId!.Value)
            .Select(g => new { DepartmentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.DepartmentId, x => x.Count);
    }

    public async Task<Department?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Departments.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Department?> GetByIdWithUsersAsync(Guid id)
    {
        return await _dbContext.Departments
            .Include(d => d.Users)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Guid?> FindIdByNameAsync(string name)
    {
        var dept = await _dbContext.Departments
            .FirstOrDefaultAsync(d => d.Name.ToLower() == name.ToLower());
        return dept?.Id;
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        string normalizedName = name.Trim().ToLower();
        return await _dbContext.Departments.AnyAsync(d => d.Name.ToLower() == normalizedName);
    }

    public async Task<bool> ExistsByNameExceptIdAsync(string name, Guid excludeId)
    {
        string normalizedName = name.Trim().ToLower();
        return await _dbContext.Departments.AnyAsync(d => d.Id != excludeId && d.Name.ToLower() == normalizedName);
    }

    public Task AddAsync(Department department)
    {
        _dbContext.Departments.Add(department);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Department department)
    {
        _dbContext.Departments.Remove(department);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<HrSystem.Application.DTOs.DepartmentStatisticsDto>> GetDepartmentStatisticsAsync(Guid? departmentId = null)
    {
        var query = _dbContext.Departments.AsQueryable();
        if (departmentId.HasValue)
        {
            query = query.Where(d => d.Id == departmentId.Value);
        }

        var stats = await query.Select(d => new HrSystem.Application.DTOs.DepartmentStatisticsDto(
            d.Id,
            d.Name,
            d.Users.Count(u => u.IsActive),
            _dbContext.TaskCards.Count(t => t.Board.DepartmentId == d.Id && !t.Column.IsDoneColumn),
            _dbContext.TaskCards.Count(t => t.Board.DepartmentId == d.Id && t.Column.IsDoneColumn)
        )).ToListAsync();

        return stats;
    }
}