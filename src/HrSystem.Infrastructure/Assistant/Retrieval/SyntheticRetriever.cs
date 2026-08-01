using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Infrastructure.Assistant.Retrieval
{
    public class SyntheticRetriever : IRetriever
    {
        public Task<IEnumerable<KnowledgeDocument>> RetrieveAsync(string question, ChatContext context, CancellationToken cancellationToken)
        {
            // For Phase 1, return empty list
            return Task.FromResult(Enumerable.Empty<KnowledgeDocument>());
        }
    }
}