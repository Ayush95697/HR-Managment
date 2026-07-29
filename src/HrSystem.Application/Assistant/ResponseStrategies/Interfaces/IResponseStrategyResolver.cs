using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Assistant.ResponseStrategies.Models;

namespace HrSystem.Application.Assistant.ResponseStrategies.Interfaces
{
    public interface IResponseStrategyResolver
    {
        ResponseMode DetermineMode(string question, AssistantIntent intent, object? structuredData);
        IResponseStrategy Resolve(ResponseMode mode);
    }
}
