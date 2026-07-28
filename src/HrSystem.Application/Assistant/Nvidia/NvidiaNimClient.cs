using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Infrastructure.Assistant.Nvidia
{
    public class NvidiaNimClient : ILLMClient
    {
        public Task<LLMResponse> GenerateResponseAsync(string prompt, CancellationToken cancellationToken)
        {
            var response = new LLMResponse
            {
                Text = "This is a placeholder response from the AI layer.",
                Model = "nvidia-placeholder-model",
                FinishReason = "stop",
                UsageTokens = 42,
                Success = true
            };
            
            return Task.FromResult(response);
        }
    }
}
