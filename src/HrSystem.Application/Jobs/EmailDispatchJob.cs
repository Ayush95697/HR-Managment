using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Email;
using HrSystem.Infrastructure.Persistence;
using HrSystem.Application.Interfaces; // For INotificationService
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Polly;

namespace HrSystem.Application.Jobs;

public class EmailDispatchJob
{
    private readonly HrDbContext _db;
    private readonly IEmailSender _sender;
    private readonly IEmailTemplateRenderer _renderer;
    private readonly INotificationService _notificationService;
    private readonly ILogger<EmailDispatchJob> _logger;

    private static readonly IAsyncPolicy _retryPolicy = Policy
        .Handle<Exception>()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: attempt => attempt switch
            {
                1 => TimeSpan.FromSeconds(30),
                2 => TimeSpan.FromMinutes(5),
                _ => TimeSpan.FromMinutes(30)
            },
            onRetry: (ex, delay, attempt, _) =>
                Console.WriteLine($"[EmailDispatchJob] Attempt {attempt} failed ({ex.Message}). Retrying in {delay}."));

    public EmailDispatchJob(
        HrDbContext db,
        IEmailSender sender,
        IEmailTemplateRenderer renderer,
        INotificationService notificationService,
        ILogger<EmailDispatchJob> logger)
    {
        _db = db;
        _sender = sender;
        _renderer = renderer;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task SendAsync(Guid emailLogId, Dictionary<string, string>? placeholders, CancellationToken ct)
    {
        // Guard: log must exist
        var log = await _db.EmailLogs
            .Include(l => l.ToUser)
            .Include(l => l.Template)
            .FirstOrDefaultAsync(l => l.Id == emailLogId);
        if (log is null) { _logger.LogWarning("EmailLog {Id} not found, skipping.", emailLogId); return; }

        // Guard: already sent (idempotent re-run safety)
        if (log.Status == EmailLogStatus.Sent) return;

        var (subject, bodyHtml) = _renderer.Render(log.Template, placeholders);

        var success = false;
        string? lastError = null;

        try
        {
            await _retryPolicy.ExecuteAsync(async () =>
            {
                try
                {
                    await _sender.SendAsync(log.ToUser.Email, subject, bodyHtml, ct);
                    success = true;
                }
                catch (Exception ex)
                {
                    lastError = ex.Message;
                    _logger.LogWarning(ex, "Email send attempt failed for log {Id}", emailLogId);
                    throw; // Polly catches this and schedules the next retry
                }
            });
        }
        catch (Exception)
        {
            // Polly exhausted all retries and rethrew the last exception.
            // We intentionally swallow it here so we can update the database to Failed.
            success = false;
        }

        if (success)
        {
            log.Status = EmailLogStatus.Sent;
            log.SentAt = DateTime.UtcNow;
            log.ErrorMessage = null;

            // Fire an in-app notification to the recipient
            await _notificationService.NotifyAsync(
                recipientId: log.ToUserId,
                actorId: log.SentById,
                type: NotificationType.EmailReceived,
                message: $"You received a new email: {subject}");
        }
        else
        {
            // All 3 retries exhausted — mark Failed with the last error
            log.Status = EmailLogStatus.Failed;
            log.ErrorMessage = lastError ?? "Unknown error after all retries";

            // Fire an in-app notification to the sender
            await _notificationService.NotifyAsync(
                recipientId: log.SentById,
                actorId: null,
                type: NotificationType.EmailFailed,
                message: $"Email to {log.ToUser.Name} failed to deliver after 3 attempts: {lastError}");
        }

        await _db.SaveChangesAsync(ct);
    }
}
