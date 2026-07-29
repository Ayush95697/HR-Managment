using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Implementations
{
    public class GetBoardStatusCapability : IAssistantCapability
    {
        private readonly IBoardService _boardService;

        public GetBoardStatusCapability(IBoardService boardService)
        {
            _boardService = boardService;
        }

        public string Name => "GetBoardStatus";
        public string Description => "Retrieves the status of boards including open and completed cards. Not available to regular employees.";

        public CapabilityMatchResult CanHandle(CapabilityMatchContext context)
        {
            var q = context.UserQuestion.ToLowerInvariant();
            if (q.Contains("board status") || q.Contains("board summary") || q.Contains("boards status"))
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
                
                var stats = await _boardService.GetBoardStatisticsAsync(userId, context.CurrentUser.Role, deptId);

                return new CapabilityResult
                {
                    Success = true,
                    CapabilityName = Name,
                    StructuredData = stats,
                    Summary = $"Retrieved status for {stats.Count} board(s)."
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
