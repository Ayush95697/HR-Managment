using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class GetDepartmentSummaryCapability : IAssistantCapability
    {
        private readonly IDepartmentService _departmentService;

        public GetDepartmentSummaryCapability(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        public string Name => "GetDepartmentSummary";
        public string Description => "Retrieves a summary of all departments, including employee count and task status. Not available to regular employees.";

        public CapabilityMatchResult CanHandle(CapabilityMatchContext context)
        {
            var q = context.UserQuestion.ToLowerInvariant();
            if (q.Contains("department summary") || q.Contains("department status") || q.Contains("department metrics"))
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
                
                var stats = await _departmentService.GetDepartmentStatisticsAsync(userId, context.CurrentUser.Role, deptId);

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = stats,
                    Summary = $"Retrieved statistics for {stats.Count} department(s)."
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
