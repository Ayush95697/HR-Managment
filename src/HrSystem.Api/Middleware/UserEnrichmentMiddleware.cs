using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Serilog.Context;

namespace HrSystem.Api.Middleware;

public class UserEnrichmentMiddleware
{
    private readonly RequestDelegate _next;

    public UserEnrichmentMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            using (LogContext.PushProperty("UserId", userId))
            {
                await _next(context);
            }
        }
        else
        {
            await _next(context);
        }
    }
}
