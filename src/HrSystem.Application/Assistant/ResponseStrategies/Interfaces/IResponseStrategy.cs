using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.ResponseStrategies.Models;

namespace HrSystem.Application.Assistant.ResponseStrategies.Interfaces
{
    public interface IResponseStrategy
    {
        bool CanHandle(ResponseMode mode);
        Task<ChatResponse> ExecuteAsync(
            CapabilityResult capabilityResult,
            ChatRequest request,
            ChatContext context,
            IEnumerable<KnowledgeDocument> retrievedDocuments,
            CancellationToken cancellationToken);
    }
}
