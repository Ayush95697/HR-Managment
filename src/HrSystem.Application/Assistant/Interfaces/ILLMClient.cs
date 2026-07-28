using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Interfaces
{
    /// <summary>
    /// Client interface for an external LLM API (e.g. NVIDIA NIM).
    /// </summary>
    public interface ILLMClient
    {
        Task<LLMResponse> GenerateResponseAsync(string prompt, CancellationToken cancellationToken);
    }
}
