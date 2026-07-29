using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface IDepartmentRepository
{
    Task<bool> ExistsAsync(Guid id);
    Task<List<Department>> GetAllAsync();
    Task<Dictionary<Guid, int>> GetActiveUserCountsAsync();
    Task<Department?> GetByIdAsync(Guid id);
    Task<Department?> GetByIdWithUsersAsync(Guid id);
    Task<bool> ExistsByNameAsync(string name);
    Task<bool> ExistsByNameExceptIdAsync(string name, Guid excludeId);
    Task AddAsync(Department department);
    Task DeleteAsync(Department department);
    Task SaveChangesAsync();
    
    Task<List<HrSystem.Application.DTOs.DepartmentStatisticsDto>> GetDepartmentStatisticsAsync(Guid? departmentId = null);
}
