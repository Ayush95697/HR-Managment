using System;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Policy = Permissions.CanViewDashboard)]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("task-velocity")]
    [ResponseCache(Duration = 60, VaryByQueryKeys = new[] { "range", "interval" })]
    public async Task<IActionResult> GetTaskVelocity([FromQuery] int range = 30, [FromQuery] string interval = "day")
    {
        var results = await _dashboardService.GetTaskVelocityAsync(range, interval, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(results);
    }

    [HttpGet("department-distribution")]
    [Authorize(Policy = Permissions.CanViewGlobalDashboard)]
    [ResponseCache(Duration = 60)]
    public async Task<IActionResult> GetDepartmentDistribution()
    {
        var results = await _dashboardService.GetDepartmentDistributionAsync();
        return Ok(results);
    }

    [HttpGet("workload-balance")]
    public async Task<IActionResult> GetWorkloadBalance()
    {
        var results = await _dashboardService.GetWorkloadBalanceAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(results);
    }

    [HttpGet("activity-feed")]
    public async Task<IActionResult> GetActivityFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var results = await _dashboardService.GetActivityFeedAsync(page, pageSize, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(results);
    }
}
