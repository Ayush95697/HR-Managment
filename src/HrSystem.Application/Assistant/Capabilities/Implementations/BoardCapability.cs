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
    public class BoardCapability : IAssistantCapability
    {
        private readonly IBoardService _boardService;
        private readonly Microsoft.Extensions.Logging.ILogger<BoardCapability> _logger;

        public BoardCapability(IBoardService boardService, Microsoft.Extensions.Logging.ILogger<BoardCapability> logger)
        {
            _boardService = boardService;
            _logger = logger;
        }

        public string Name => "BoardDomainCapability";
        public string Description => "Retrieves board statuses, active projects, and completion metrics.";
        public AssistantIntent SupportedIntent => AssistantIntent.BoardInformation;

        public async Task<CapabilityResult> ExecuteAsync(CapabilityRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var userId = Guid.Parse(request.CurrentUser.UserId);
                Guid? deptId = !string.IsNullOrEmpty(request.CurrentUser.DepartmentId) ? Guid.Parse(request.CurrentUser.DepartmentId) : null;

                var query = request.Query as HrSystem.Application.Assistant.Capabilities.Queries.BoardQuery;
                var stats = await _boardService.GetBoardStatisticsAsync(userId, request.CurrentUser.Role, deptId, query);

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = stats,
                    Summary = $"Retrieved board statistics."
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "BoardCapability failed for user {UserId}", request.CurrentUser.UserId);
                return new CapabilityResult
                {
                    Success = false,
                    CapabilityName = Name,
                    Summary = "Unable to retrieve the requested board information.",
                    StructuredData = null
                };
            }
        }
    }
}