using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class GetCriticalTasksCapability : IAssistantCapability
    {
        private readonly ITaskCardService _taskCardService;

        public GetCriticalTasksCapability(ITaskCardService taskCardService)
        {
            _taskCardService = taskCardService;
        }

        public string Name => "GetCriticalTasks";
        public string Description => "Retrieves a summary of critical tasks, including the number of tasks and assigned employees. Not available to regular employees.";

        public CapabilityMatchResult CanHandle(CapabilityMatchContext context)
        {
            var q = context.UserQuestion.ToLowerInvariant();
            if (q.Contains("critical task"))
            {
                return CapabilityMatchResult.Match(Name, 0.9);
            }
            return CapabilityMatchResult.NoMatch();
        }

        public async Task<CapabilityResult> ExecuteAsync(CapabilityExecutionContext context, CancellationToken cancellationToken)
        {
            try
            {
                var userId = Guid.Parse(context.CurrentUser.UserId);
                Guid? deptId = !string.IsNullOrEmpty(context.CurrentUser.DepartmentId) ? Guid.Parse(context.CurrentUser.DepartmentId) : null;
                
                var stats = await _taskCardService.GetCriticalTasksSummaryAsync(userId, context.CurrentUser.Role, deptId);

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = stats,
                    Summary = $"Found {stats.CriticalTasksCount} critical tasks."
                };
            }
            catch (Exception)
            {
                return new CapabilityResult
                {
                    Success = false,
                    CapabilityName = Name,
                    Summary = "I couldn't retrieve the requested information.",
                    StructuredData = null
                };
            }
        }
    }
}
