using System.Threading;
using System.Threading.Tasks;

using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Builders
{
    public class AdminContextBuilder : IContextBuilder
    {
        public bool CanHandle(string role) => role == "Admin";

        public Task<ChatContext> BuildAsync(CurrentUserContext user, CancellationToken cancellationToken)
        {
            var context = new ChatContext
            {
                User = user,
                DynamicContext = "You are assisting an Admin. Provide comprehensive system-level insights and full administrative support."
            };
            return Task.FromResult(context);
        }
    }
}