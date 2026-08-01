using System;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Models;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;

namespace HrSystem.Infrastructure.HealthChecks;

public class AiAssistantHealthCheck : IHealthCheck
{
    private readonly AssistantOptions _options;

    public AiAssistantHealthCheck(IOptions<AssistantOptions> options)
    {
        _options = options.Value;
    }

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var apiKey = Environment.GetEnvironmentVariable("NVIDIA_API_KEY");

        if (string.IsNullOrWhiteSpace(_options.Endpoint))
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("AI Assistant Endpoint is not configured."));
        }

        if (string.IsNullOrWhiteSpace(_options.Model))
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("AI Assistant Model is not configured."));
        }

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return Task.FromResult(HealthCheckResult.Unhealthy("NVIDIA_API_KEY environment variable is not configured."));
        }

        return Task.FromResult(HealthCheckResult.Healthy("AI Assistant configuration is valid."));
    }
}
