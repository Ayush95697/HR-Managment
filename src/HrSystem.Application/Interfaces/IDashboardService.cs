using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IDashboardService
{
    Task<List<TaskVelocityDto>> GetTaskVelocityAsync(int range, string interval, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<List<DepartmentDistributionDto>> GetDepartmentDistributionAsync();
    Task<List<WorkloadBalanceDto>> GetWorkloadBalanceAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<List<ActivityFeedItemDto>> GetActivityFeedAsync(int page, int pageSize, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
}