using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class GetMyTasksCapability : IAssistantCapability
    {
        private readonly ITaskCardService _taskCardService;

        public GetMyTasksCapability(ITaskCardService taskCardService)
        {
            _taskCardService = taskCardService;
        }

        public string Name => "GetMyTasks";
        public string Description => "Retrieves the active tasks assigned to the current employee.";

        public CapabilityMatchResult CanHandle(CapabilityMatchContext context)
        {
            var q = context.UserQuestion.ToLowerInvariant();
            if (q.Contains("my task") || q.Contains("assigned to me"))
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
                return await ExecuteInternalAsync(userId, context);
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
        
        private async Task<CapabilityResult> ExecuteInternalAsync(Guid userId, CapabilityExecutionContext context)
        {
            // DepartmentId mapping workaround - assuming it's stored correctly or can be ignored if not HR
            Guid? deptId = null;
            // Since employee getting their own tasks doesn't strictly need DeptId for the query in our new implementation (it checks userId)
            
            var tasks = await _taskCardService.GetAssignedTasksAsync(userId, userId, context.CurrentUser.Role, deptId);
            
            return new CapabilityResult
            {
                Success = true,
                CapabilityName = Name,
                StructuredData = tasks,
                Summary = $"Found {tasks.Count} active tasks assigned to you."
            };
        }
    }
}
