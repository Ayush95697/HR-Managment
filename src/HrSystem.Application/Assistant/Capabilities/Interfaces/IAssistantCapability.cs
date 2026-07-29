using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Models;

namespace HrSystem.Application.Assistant.Capabilities.Interfaces
{
    public interface IAssistantCapability
    {
        string Name { get; }
        string Description { get; }
        
        CapabilityMatchResult CanHandle(CapabilityMatchContext context);
        
        Task<CapabilityResult> ExecuteAsync(CapabilityExecutionContext context, CancellationToken cancellationToken);
    }
}
