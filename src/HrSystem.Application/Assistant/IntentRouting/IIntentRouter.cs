namespace HrSystem.Application.Assistant.IntentRouting
{
    public interface IIntentRouter
    {
        AssistantIntent Route(string question);
    }
}