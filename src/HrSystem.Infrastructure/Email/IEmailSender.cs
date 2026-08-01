using System.Threading;
using System.Threading.Tasks;

namespace HrSystem.Infrastructure.Email;

public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string bodyHtml, CancellationToken ct = default);
}