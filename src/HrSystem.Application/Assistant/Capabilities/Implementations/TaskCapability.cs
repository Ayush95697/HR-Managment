using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class TaskCapability : IAssistantCapability
    {
        private readonly ITaskCardService _taskCardService;

        public TaskCapability(ITaskCardService taskCardService)
        {
            _taskCardService = taskCardService;
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
                
                object criticalTasksStats = null;
                // Regular employees can't query critical tasks stats (it throws AppUnauthorizedException in service)
                if (request.CurrentUser.Role != "Employee")
                {
                    try
                    {
                        criticalTasksStats = await _taskCardService.GetCriticalTasksSummaryAsync(userId, request.CurrentUser.Role, deptId);
                    }
                    catch
                    {
                        // Ignore RBAC or other exceptions for the secondary data
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
            catch (Exception)
            {
                return new CapabilityResult
                {
                    Success = false,
                    CapabilityName = Name,
                    Summary = "I couldn't retrieve the requested task information.",
                    StructuredData = null
                };
            }
        }
    }
}
