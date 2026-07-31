using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class DepartmentCapability : IAssistantCapability
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentCapability(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        public string Name => "DepartmentDomainCapability";
        public string Description => "Retrieves department metrics, headcount, and summary statistics.";
        public AssistantIntent SupportedIntent => AssistantIntent.DepartmentInformation;

        public async Task<CapabilityResult> ExecuteAsync(CapabilityRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = Guid.Parse(request.CurrentUser.UserId);
                Guid? deptId = !string.IsNullOrEmpty(request.CurrentUser.DepartmentId) ? Guid.Parse(request.CurrentUser.DepartmentId) : null;

                var query = request.Query as HrSystem.Application.Assistant.Capabilities.Queries.DepartmentQuery;
                var stats = await _departmentService.GetDepartmentStatisticsAsync(userId, request.CurrentUser.Role, deptId, query);

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = stats,
                    Summary = $"Retrieved department statistics."
                };
            }
            catch (Exception)
            {
                return new CapabilityResult
                {
                    Success = false,
                    CapabilityName = Name,
                    Summary = "I couldn't retrieve the requested department information.",
                    StructuredData = null
                };
            }
        }
    }
}
