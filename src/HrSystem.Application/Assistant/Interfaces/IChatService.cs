using System.Threading;
using System.Threading.Tasks;

using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Interfaces
{
    /// <summary>
    /// Orchestrates the assistant chat pipeline.
    /// </summary>
    public interface IChatService
    {
        Task<ChatResponse> ProcessChatAsync(CurrentUserContext user, ChatRequest request, CancellationToken cancellationToken);
    }
}