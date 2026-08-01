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
    public class EmployeeCapability : IAssistantCapability
    {
        private readonly IUserService _userService;
        private readonly Microsoft.Extensions.Logging.ILogger<EmployeeCapability> _logger;

        public EmployeeCapability(IUserService userService, Microsoft.Extensions.Logging.ILogger<EmployeeCapability> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        public string Name => "EmployeeDomainCapability";
        public string Description => "Retrieves employee headcount and distribution metrics.";
        public AssistantIntent SupportedIntent => AssistantIntent.EmployeeInformation;

        public async Task<CapabilityResult> ExecuteAsync(CapabilityRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = Guid.Parse(request.CurrentUser.UserId);
                Guid? deptId = !string.IsNullOrEmpty(request.CurrentUser.DepartmentId) ? Guid.Parse(request.CurrentUser.DepartmentId) : null;

                var query = request.Query as HrSystem.Application.Assistant.Capabilities.Queries.EmployeeQuery;
                var stats = await _userService.GetEmployeeStatisticsAsync(userId, request.CurrentUser.Role, deptId, query);

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = stats,
                    Summary = $"Retrieved employee statistics."
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "EmployeeCapability failed for user {UserId}", request.CurrentUser.UserId);
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