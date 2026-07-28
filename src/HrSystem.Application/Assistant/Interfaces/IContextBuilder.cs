using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Interfaces
{
    /// <summary>
    /// Interface for building role-specific chat context.
    /// </summary>
    public interface IContextBuilder
    {
        bool CanHandle(string role);
        Task<ChatContext> BuildAsync(CurrentUserContext user, CancellationToken cancellationToken);
    }
}
