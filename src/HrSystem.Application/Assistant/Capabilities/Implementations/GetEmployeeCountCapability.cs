using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class GetEmployeeCountCapability : IAssistantCapability
    {
        private readonly IUserService _userService;

        public GetEmployeeCountCapability(IUserService userService)
        {
            _userService = userService;
        }

        public string Name => "GetEmployeeCount";
        public string Description => "Retrieves total employee count and headcount distribution by department. Not available to regular employees.";

        public CapabilityMatchResult CanHandle(CapabilityMatchContext context)
        {
            var q = context.UserQuestion.ToLowerInvariant();
            if (q.Contains("employee count") || q.Contains("how many employees") || q.Contains("headcount"))
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
                
                var stats = await _userService.GetEmployeeStatisticsAsync(userId, context.CurrentUser.Role, deptId);

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = stats,
                    Summary = $"Found {stats.TotalEmployees} total active employees."
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
