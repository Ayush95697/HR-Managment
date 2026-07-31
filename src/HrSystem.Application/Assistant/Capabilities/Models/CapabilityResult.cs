using System.Collections.Generic;

namespace HrSystem.Application.Assistant.Capabilities.Models
{
    public class CapabilityResult
    {
        public bool Success { get; set; }
        public string CapabilityName { get; set; } = string.Empty;

        // Storing as object so it can be serialized when building the prompt
        public object? StructuredData { get; set; }

        public string Summary { get; set; } = string.Empty;
        public Dictionary<string, string> Metadata { get; set; } = new();
    }
}
