using System;
using System.Threading;
using System.Threading.Tasks;

using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Interfaces;

using Microsoft.Extensions.Logging;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class TaskCapability : IAssistantCapability
    {
        private readonly ITaskCardService _taskCardService;
        private readonly Microsoft.Extensions.Logging.ILogger<TaskCapability> _logger;

        public TaskCapability(ITaskCardService taskCardService, Microsoft.Extensions.Logging.ILogger<TaskCapability> logger)
        {
            _taskCardService = taskCardService;
            _logger = logger;
        }

        public string Name => "TaskDomainCapability";
        public string Description => "Retrieves task information, including assigned tasks and critical tasks summary.";
        public AssistantIntent SupportedIntent => AssistantIntent.TaskInformation;

        public async Task<CapabilityResult> ExecuteAsync(CapabilityRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = Guid.Parse(request.CurrentUser.UserId);
                Guid? deptId = !string.IsNullOrEmpty(request.CurrentUser.DepartmentId) ? Guid.Parse(request.CurrentUser.DepartmentId) : null;

                var query = request.Query as HrSystem.Application.Assistant.Capabilities.Queries.TaskQuery;
                var assignedTasks = await _taskCardService.GetAssignedTasksAsync(userId, userId, request.CurrentUser.Role, deptId, query);

                object? criticalTasksStats = null;
                // Regular employees can't query critical tasks stats (it throws AppUnauthorizedException in service)
                if (request.CurrentUser.Role != "Employee")
                {
                    try
                    {
                        criticalTasksStats = await _taskCardService.GetCriticalTasksSummaryAsync(userId, request.CurrentUser.Role, deptId);
                    }
                    catch (Exception ex)
                    {
                        // Ignore RBAC or other exceptions for the secondary data
                        _logger.LogWarning(ex, "Failed to retrieve critical tasks summary for User {UserId}. Intentionally swallowed.", userId);
                    }
                }

                var structuredData = new
                {
                    AssignedTasks = assignedTasks,
                    CriticalTasksSummary = criticalTasksStats
                };

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = structuredData,
                    Summary = "Successfully retrieved task domain information."
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "TaskCapability failed for user {UserId}", request.CurrentUser.UserId);
                return new CapabilityResult
                {
                    Success = false,
                    CapabilityName = Name,
                    Summary = "Unable to retrieve the requested task information.",
                    StructuredData = null
                };
            }
        }
    }
}