using System;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.Capabilities.Queries;

namespace HrSystem.Application.Assistant.Capabilities.Models
{
    public class CapabilityRequest
    {
        public AssistantIntent Intent { get; set; }
        public CurrentUserContext CurrentUser { get; set; } = null!;
        public string OriginalQuestion { get; set; } = string.Empty;
        public ICapabilityQuery? Query { get; set; }
    }
}