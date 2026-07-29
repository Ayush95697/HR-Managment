using System.Collections.Generic;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;

namespace HrSystem.Application.Assistant.Capabilities
{
    public class CapabilityResolver : ICapabilityResolver
    {
        private readonly IEnumerable<IAssistantCapability> _capabilities;

        public CapabilityResolver(IEnumerable<IAssistantCapability> capabilities)
        {
            _capabilities = capabilities;
        }

        public IAssistantCapability? Resolve(CapabilityMatchContext context)
        {
            IAssistantCapability? bestMatch = null;
            double maxConfidence = 0.0;

            foreach (var capability in _capabilities)
            {
                var matchResult = capability.CanHandle(context);
                if (matchResult.IsMatch && matchResult.Confidence > maxConfidence)
                {
                    maxConfidence = matchResult.Confidence;
                    bestMatch = capability;
                }
            }

            // Optional: return only if confidence > some threshold (e.g., 0.8)
            // But for deterministic, 1.0 is returned, so > 0 is fine.
            return bestMatch;
        }
    }
}
