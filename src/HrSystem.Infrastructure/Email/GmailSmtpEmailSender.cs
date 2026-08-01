using System;
using System.Threading;
using System.Threading.Tasks;

using MailKit.Net.Smtp;
using MailKit.Security;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using MimeKit;
using MimeKit.Text;

namespace HrSystem.Infrastructure.Email;

public class GmailSmtpEmailSender : IEmailSender
{
    private readonly string _fromAddress;
    private readonly string _appPassword;
    private readonly ILogger<GmailSmtpEmailSender> _logger;

    public GmailSmtpEmailSender(IConfiguration config, ILogger<GmailSmtpEmailSender> logger)
    {
        _fromAddress = config["Email:FromAddress"]
            ?? throw new InvalidOperationException("Email:FromAddress not configured.");
        _appPassword = config["Email:GmailPassword"]
            ?? throw new InvalidOperationException("Email:GmailPassword not configured. Use dotnet user-secrets.");
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string bodyHtml, CancellationToken ct = default)
    {
        using var client = new SmtpClient();
        await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls, ct);
        await client.AuthenticateAsync(_fromAddress, _appPassword, ct);

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("HR Management System", _fromAddress));
        message.To.Add(new MailboxAddress(string.Empty, toEmail));
        message.Subject = subject;
        message.Body = new TextPart(TextFormat.Html) { Text = bodyHtml };

        await client.SendAsync(message, ct);
        await client.DisconnectAsync(quit: true, ct);

        _logger.LogInformation("Email sent to {Recipient} via Gmail SMTP", toEmail);
    }
}