using HrSystem.Api.Middleware;
using Microsoft.AspNetCore.Builder;

namespace HrSystem.Api.Extensions;

public static class CorrelationIdExtensions
{
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
    {
        return app.UseMiddleware<CorrelationIdMiddleware>();
    }

    public static IApplicationBuilder UseUserEnrichment(this IApplicationBuilder app)
    {
        return app.UseMiddleware<UserEnrichmentMiddleware>();
    }
}
