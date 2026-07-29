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

        public async Task<CapabilityResult> ExecuteAsync(CapabilityExecutionContext context, CancellationToken cancellationToken)
        {
            try
            {
                var userId = Guid.Parse(context.CurrentUser.UserId);
                Guid? deptId = !string.IsNullOrEmpty(context.CurrentUser.DepartmentId) ? Guid.Parse(context.CurrentUser.DepartmentId) : null;
                
                // Fetch broad aggregated data that LLM can use to answer specific questions
                var assignedTasks = await _taskCardService.GetAssignedTasksAsync(userId, userId, context.CurrentUser.Role, deptId);
                
                object criticalTasksStats = null;
                // Regular employees can't query critical tasks stats (it throws AppUnauthorizedException in service)
                if (context.CurrentUser.Role != "Employee")
                {
                    try
                    {
                        criticalTasksStats = await _taskCardService.GetCriticalTasksSummaryAsync(userId, context.CurrentUser.Role, deptId);
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
