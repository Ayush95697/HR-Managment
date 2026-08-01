using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.IntentRouting;

namespace HrSystem.Application.Assistant.Capabilities.Interfaces
{
    public interface ICapabilityResolver
    {
        IAssistantCapability? Resolve(AssistantIntent intent);
    }
}