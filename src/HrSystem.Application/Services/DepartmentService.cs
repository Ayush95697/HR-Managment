using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepository;

    public DepartmentService(IDepartmentRepository departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<List<DepartmentDto>> GetDepartmentsAsync()
    {
        var departments = await _departmentRepository.GetAllAsync();
        var activeUserCounts = await _departmentRepository.GetActiveUserCountsAsync();

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
        if (await _departmentRepository.ExistsByNameAsync(request.Name))
        {
            throw new InvalidOperationException($"Department with name '{request.Name}' already exists.");
        }

        var department = new Department
        {
            Id = Guid.NewGuid(),
            Name = request.Name
        };

        await _departmentRepository.AddAsync(department);
        await _departmentRepository.SaveChangesAsync();

        return new DepartmentDto(department.Id, department.Name, 0);
    }

    public async Task DeleteDepartmentAsync(Guid id)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        if (department == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Department with ID {id} not found.");
        }

        await _departmentRepository.DeleteAsync(department);
        await _departmentRepository.SaveChangesAsync();
    }

    public async Task<List<DepartmentStatisticsDto>> GetDepartmentStatisticsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        // Enforce RBAC
        if (currentUserRole == RoleType.Employee.ToString())
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Employees cannot view department statistics.");
        }

        Guid? departmentFilter = currentUserRole == RoleType.HR.ToString() ? currentUserDeptId : null;

        return await _departmentRepository.GetDepartmentStatisticsAsync(departmentFilter);
    }
}
