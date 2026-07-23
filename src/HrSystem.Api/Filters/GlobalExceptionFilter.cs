using System;
using System.Collections.Generic;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Threading.Tasks;
using HrSystem.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HrSystem.Api.Filters;

public class GlobalExceptionFilter : IExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    {
        _logger = logger;
    }

    public void OnException(ExceptionContext context)
    {
        var exception = context.Exception;
        var problemDetails = new ProblemDetails
        {
            Instance = context.HttpContext.Request.Path
        };

        bool handled = true;

        switch (exception)
        {
            case DbUpdateConcurrencyException:
                problemDetails.Status = (int)HttpStatusCode.Conflict;
                problemDetails.Title = "Concurrency Conflict";
                problemDetails.Detail = "Stale write detected. The resource has been updated by another user.";
                break;

            case UnauthorizedAccessException:
            case AppUnauthorizedException:
                if (exception.Message.Contains("Invalid email or password") || exception.Message.Contains("refresh token"))
                {
                    problemDetails.Status = (int)HttpStatusCode.Unauthorized;
                    problemDetails.Title = "Unauthorized";
                    problemDetails.Detail = exception.Message;
                }
                else
                {
                    problemDetails.Status = (int)HttpStatusCode.Forbidden;
                    problemDetails.Title = "Forbidden";
                    problemDetails.Detail = exception.Message;
                }
                break;

            case KeyNotFoundException:
            case AppNotFoundException:
                problemDetails.Status = (int)HttpStatusCode.NotFound;
                problemDetails.Title = "Resource Not Found";
                problemDetails.Detail = exception.Message;
                break;

            case ArgumentException or InvalidOperationException:
            case AppBadRequestException:
                problemDetails.Status = (int)HttpStatusCode.BadRequest;
                problemDetails.Title = "Bad Request";
                problemDetails.Detail = exception.Message;
                break;

            default:
                // Let unknown exceptions (bugs) bubble up to the middleware 
                // so Visual Studio correctly highlights them as unhandled.
                handled = false;
                break;
        }

        if (handled)
        {
            context.Result = new ObjectResult(problemDetails)
            {
                StatusCode = problemDetails.Status
            };
            context.ExceptionHandled = true;
        }
    }
}
