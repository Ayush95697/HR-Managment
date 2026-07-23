using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using HrSystem.Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HrSystem.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var problemDetails = new ProblemDetails
        {
            Instance = context.Request.Path
        };

        switch (exception)
        {
            case DbUpdateConcurrencyException:
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                problemDetails.Status = (int)HttpStatusCode.Conflict;
                problemDetails.Title = "Concurrency Conflict";
                problemDetails.Detail = "Stale write detected. The resource has been updated by another user.";
                break;

            case UnauthorizedAccessException:
            case AppUnauthorizedException:
                // If invalid login attempt, return 401 Unauthorized. Otherwise 403 Forbidden.
                if (exception.Message.Contains("Invalid email or password") || exception.Message.Contains("refresh token"))
                {
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    problemDetails.Status = (int)HttpStatusCode.Unauthorized;
                    problemDetails.Title = "Unauthorized";
                    problemDetails.Detail = exception.Message;
                }
                else
                {
                    context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                    problemDetails.Status = (int)HttpStatusCode.Forbidden;
                    problemDetails.Title = "Forbidden";
                    problemDetails.Detail = exception.Message;
                }
                break;

            case KeyNotFoundException:
            case AppNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                problemDetails.Status = (int)HttpStatusCode.NotFound;
                problemDetails.Title = "Resource Not Found";
                problemDetails.Detail = exception.Message;
                break;

            case ArgumentException or InvalidOperationException:
            case AppBadRequestException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                problemDetails.Status = (int)HttpStatusCode.BadRequest;
                problemDetails.Title = "Bad Request";
                problemDetails.Detail = exception.Message;
                break;

            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                problemDetails.Status = (int)HttpStatusCode.InternalServerError;
                problemDetails.Title = "Internal Server Error";
                problemDetails.Detail = "An unexpected error occurred. Please try again later.";
                break;
        }

        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(problemDetails, jsonOptions);

        return context.Response.WriteAsync(json);
    }
}
