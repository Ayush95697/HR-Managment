using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;

namespace HrSystem.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<List<TaskVelocityDto>> GetTaskVelocityAsync(int range, string interval, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var since = DateTime.UtcNow.Date.AddDays(-range);
        var resultsDict = await _dashboardRepository.GetTaskVelocityCountsAsync(range, currentUserId, currentUserRole, currentUserDeptId);
        
        var finalResults = new List<TaskVelocityDto>();
        for (int i = 0; i <= range; i++)
        {
            var date = since.AddDays(i);
            finalResults.Add(new TaskVelocityDto(
                Bucket: date,
                Count: resultsDict.ContainsKey(date) ? resultsDict[date] : 0
            ));
        }

        return finalResults;
    }

    public async Task<List<DepartmentDistributionDto>> GetDepartmentDistributionAsync()
    {
        return await _dashboardRepository.GetDepartmentDistributionAsync();
    }

    public async Task<List<WorkloadBalanceDto>> GetWorkloadBalanceAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        return await _dashboardRepository.GetWorkloadBalanceAsync(currentUserId, currentUserRole, currentUserDeptId);
    }

    public async Task<List<ActivityFeedItemDto>> GetActivityFeedAsync(int page, int pageSize, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var taskEvents = await _dashboardRepository.GetTaskActivityFeedAsync(page, pageSize, currentUserId, currentUserRole, currentUserDeptId);
        var onboardingEvents = await _dashboardRepository.GetOnboardingFeedAsync(page, pageSize, currentUserId, currentUserRole, currentUserDeptId);

        return taskEvents.Concat(onboardingEvents)
            .OrderByDescending(e => e.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();
    }
}
