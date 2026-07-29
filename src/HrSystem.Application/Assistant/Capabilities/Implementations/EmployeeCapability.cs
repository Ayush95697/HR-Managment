using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class EmployeeCapability : IAssistantCapability
    {
        private readonly IUserService _userService;

        public EmployeeCapability(IUserService userService)
        {
            _userService = userService;
        }

        public string Name => "EmployeeDomainCapability";
        public string Description => "Retrieves employee headcount and distribution metrics.";
        public AssistantIntent SupportedIntent => AssistantIntent.EmployeeInformation;

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
                    Summary = $"Retrieved employee statistics."
                };
            }
            catch (Exception)
            {
                return new CapabilityResult
                {
                    Success = false,
                    CapabilityName = Name,
                    Summary = "I couldn't retrieve the requested employee information.",
                    StructuredData = null
                };
            }
        }
    }
}
