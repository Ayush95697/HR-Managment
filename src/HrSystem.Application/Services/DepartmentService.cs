using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly HrDbContext _dbContext;

    public DepartmentService(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<DepartmentDto>> GetDepartmentsAsync()
    {
        // BUG-07 FIX: Use a subquery count instead of unloaded d.Users navigation property.
        // Lazy loading is not configured; calling d.Users.Count() without Include would return 0.
        var departments = await _dbContext.Departments.ToListAsync();

        var activeUserCounts = await _dbContext.Users
            .Where(u => u.IsActive && u.DepartmentId != null)
            .GroupBy(u => u.DepartmentId!.Value)
            .Select(g => new { DepartmentId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.DepartmentId, x => x.Count);

        return departments
            .Select(d => new DepartmentDto(
                d.Id,
                d.Name,
                activeUserCounts.TryGetValue(d.Id, out var count) ? count : 0
            ))
            .ToList();
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request)
    {
        if (await _dbContext.Departments.AnyAsync(d => d.Name.ToLower() == request.Name.ToLower()))
        {
            throw new InvalidOperationException($"Department with name '{request.Name}' already exists.");
        }

        var department = new Department
        {
            Id = Guid.NewGuid(),
            Name = request.Name
        };

        _dbContext.Departments.Add(department);
        await _dbContext.SaveChangesAsync();

        return new DepartmentDto(department.Id, department.Name, 0);
    }
}
