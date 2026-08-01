using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using HrSystem.Infrastructure.HealthChecks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace HrSystem.Api.Extensions;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddAppHealthChecks(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddHealthChecks()
            .AddCheck("Application", () => HealthCheckResult.Healthy("Application is running."), tags: new[] { "live" })
            .AddSqlServer(connectionString ?? string.Empty, name: "Database", tags: new[] { "ready" })
            .AddHangfire(options => { options.MinimumAvailableServers = 1; }, name: "Hangfire", tags: new[] { "ready" })
            .AddCheck<AiAssistantHealthCheck>("AI_Assistant", tags: new[] { "ready" });

        return services;
    }

    public static IApplicationBuilder MapAppHealthChecks(this WebApplication app)
    {
        var optionsFull = new HealthCheckOptions
        {
            ResponseWriter = WriteHealthCheckResponse
        };

        var optionsLive = new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("live"),
            ResponseWriter = WriteHealthCheckResponse
        };

        var optionsReady = new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("ready"),
            ResponseWriter = WriteHealthCheckResponse
        };

        app.MapHealthChecks("/health", optionsFull);
        app.MapHealthChecks("/health/live", optionsLive);
        app.MapHealthChecks("/health/ready", optionsReady);

        return app;
    }

    private static Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = report.Status.ToString(),
            totalDuration = report.TotalDuration.TotalMilliseconds,
            results = report.Entries.ToDictionary(
                e => e.Key,
                e => new
                {
                    status = e.Value.Status.ToString(),
                    description = e.Value.Description,
                    duration = e.Value.Duration.TotalMilliseconds,
                    error = e.Value.Exception?.Message
                })
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true }));
    }
}
