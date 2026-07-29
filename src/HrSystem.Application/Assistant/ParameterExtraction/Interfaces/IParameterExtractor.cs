using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.IntentRouting;

namespace HrSystem.Application.Assistant.ParameterExtraction.Interfaces
{
    public interface IParameterExtractor
    {
        Task<CapabilityRequest> ExtractAsync(CurrentUserContext user, string question, AssistantIntent intent);
    }
}
