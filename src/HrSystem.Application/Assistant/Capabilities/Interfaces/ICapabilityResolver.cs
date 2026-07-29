using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.Capabilities.Interfaces;

namespace HrSystem.Application.Assistant.Capabilities.Interfaces
{
    public interface ICapabilityResolver
    {
        IAssistantCapability? Resolve(CapabilityMatchContext context);
    }
}
