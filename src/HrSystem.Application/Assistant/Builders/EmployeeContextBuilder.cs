using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Builders
{
    public class EmployeeContextBuilder : IContextBuilder
    {
        public bool CanHandle(string role) => role == "Employee";

        public Task<ChatContext> BuildAsync(CurrentUserContext user, CancellationToken cancellationToken)
        {
            var context = new ChatContext
            {
                User = user,
                DynamicContext = "You are assisting an Employee. Provide helpful, concise answers relevant to their department."
            };
            return Task.FromResult(context);
        }
    }
}
