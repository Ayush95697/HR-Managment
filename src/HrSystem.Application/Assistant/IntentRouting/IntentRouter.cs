namespace HrSystem.Application.Assistant.IntentRouting
{
    public class IntentRouter : IIntentRouter
    {
        public AssistantIntent Route(string question)
        {
            var q = question.ToLowerInvariant();

            if (q.Contains("task") || q.Contains("assigned to me"))
            {
                return AssistantIntent.TaskInformation;
            }
            if (q.Contains("department") || q.Contains("departments"))
            {
                return AssistantIntent.DepartmentInformation;
            }
            if (q.Contains("employee") || q.Contains("employees") || q.Contains("headcount"))
            {
                return AssistantIntent.EmployeeInformation;
            }
            if (q.Contains("board") || q.Contains("boards"))
            {
                return AssistantIntent.BoardInformation;
            }
            if (q.Contains("notification") || q.Contains("notifications"))
            {
                return AssistantIntent.NotificationInformation;
            }
            if (q.Contains("dashboard") || q.Contains("metrics"))
            {
                return AssistantIntent.DashboardInformation;
            }
            if (q.Contains("email") || q.Contains("emails"))
            {
                return AssistantIntent.EmailInformation;
            }

            // If it doesn't match any deterministic rules, it's a general question or unknown.
            // Currently falling back to GeneralConversation for anything not explicitly matched.
            return AssistantIntent.GeneralConversation;
        }
    }
}
