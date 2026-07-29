using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Builders
{
    public class HrContextBuilder : IContextBuilder
    {
        public bool CanHandle(string role) => role == "HR";

        public Task<ChatContext> BuildAsync(CurrentUserContext user, CancellationToken cancellationToken)
        {
            var context = new ChatContext
            {
                User = user,
                DynamicContext = "You are assisting an HR representative. Provide insights regarding department management, user tracking, and administrative tasks."
            };
            return Task.FromResult(context);
        }
    }
}
