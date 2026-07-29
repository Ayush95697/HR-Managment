using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;

namespace HrSystem.Application.Assistant.Capabilities.Interfaces
{
    public interface IAssistantCapability
    {
        string Name { get; }
        string Description { get; }
        
        AssistantIntent SupportedIntent { get; }
        
        Task<CapabilityResult> ExecuteAsync(CapabilityRequest request, CancellationToken cancellationToken);
    }
}
