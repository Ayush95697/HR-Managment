using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Interfaces
{
    /// <summary>
    /// Interface for retrieving context documents (RAG).
    /// </summary>
    public interface IRetriever
    {
        Task<IEnumerable<KnowledgeDocument>> RetrieveAsync(string question, ChatContext context, CancellationToken cancellationToken);
    }
}