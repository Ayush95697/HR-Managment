using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces.Repositories;

public interface IDashboardRepository
{
    Task<Dictionary<DateTime, int>> GetTaskVelocityCountsAsync(int range, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<List<DepartmentDistributionDto>> GetDepartmentDistributionAsync();
    Task<List<WorkloadBalanceDto>> GetWorkloadBalanceAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<List<ActivityFeedItemDto>> GetTaskActivityFeedAsync(int page, int pageSize, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<List<ActivityFeedItemDto>> GetOnboardingFeedAsync(int page, int pageSize, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
}