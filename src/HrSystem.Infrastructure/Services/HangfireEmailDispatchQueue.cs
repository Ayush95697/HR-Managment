using System;
using System.Collections.Generic;
using Hangfire;
using HrSystem.Application.Interfaces;
using HrSystem.Infrastructure.Jobs;

namespace HrSystem.Infrastructure.Services;

public class HangfireEmailDispatchQueue : IEmailDispatchQueue
{
    private readonly IBackgroundJobClient _backgroundJobClient;

    public HangfireEmailDispatchQueue(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }

    public void EnqueueDispatch(Guid emailLogId, Dictionary<string, string>? placeholders)
    {
        _backgroundJobClient.Enqueue<EmailDispatchJob>(
            job => job.SendAsync(emailLogId, placeholders, System.Threading.CancellationToken.None));
    }
}
