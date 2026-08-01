using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetDepartmentsAsync();
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request);
    Task DeleteDepartmentAsync(Guid id);

    Task<List<DepartmentStatisticsDto>> GetDepartmentStatisticsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId, HrSystem.Application.Assistant.Capabilities.Queries.DepartmentQuery? query = null);
}