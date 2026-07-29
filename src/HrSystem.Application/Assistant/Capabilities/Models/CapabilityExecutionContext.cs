using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Capabilities.Models
{
    public class CapabilityExecutionContext
    {
        public CurrentUserContext CurrentUser { get; set; } = new();
        public string UserQuestion { get; set; } = string.Empty;
    }
}
