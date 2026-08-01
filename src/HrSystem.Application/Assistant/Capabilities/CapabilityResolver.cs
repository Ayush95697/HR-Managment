using System.Collections.Generic;
using System.Linq;

using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;

namespace HrSystem.Application.Assistant.Capabilities
{
    public class CapabilityResolver : ICapabilityResolver
    {
        private readonly IEnumerable<IAssistantCapability> _capabilities;

        public CapabilityResolver(IEnumerable<IAssistantCapability> capabilities)
        {
            _capabilities = capabilities;
        }

        public IAssistantCapability? Resolve(AssistantIntent intent)
        {
            return _capabilities.FirstOrDefault(c => c.SupportedIntent == intent);
        }
    }
}