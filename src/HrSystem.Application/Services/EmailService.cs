using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Application.Services;

public class EmailService : IEmailService
{
    private readonly HrDbContext _dbContext;

    public EmailService(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<EmailTemplateDto>> GetTemplatesAsync()
    {
        return await _dbContext.EmailTemplates
            .Select(t => new EmailTemplateDto(
                t.Id,
                t.Name,
                t.Subject,
                t.BodyHtml,
                t.PlaceholderSchemaJson
            ))
            .ToListAsync();
    }

    public async Task<EmailTemplateDto> CreateTemplateAsync(CreateEmailTemplateRequest request)
    {
        var template = new EmailTemplate
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Subject = request.Subject,
            BodyHtml = request.BodyHtml,
            PlaceholderSchemaJson = request.PlaceholderSchemaJson
        };

        _dbContext.EmailTemplates.Add(template);
        await _dbContext.SaveChangesAsync();

        return new EmailTemplateDto(
            template.Id,
            template.Name,
            template.Subject,
            template.BodyHtml,
            template.PlaceholderSchemaJson
        );
    }

    public async Task<EmailLogDto> SendEmailAsync(SendEmailRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        // 1. Idempotency Check
        var existingLog = await _dbContext.EmailLogs
            .Include(el => el.ToUser)
            .Include(el => el.Template)
            .Include(el => el.SentBy)
            .FirstOrDefaultAsync(el => el.IdempotencyKey == request.IdempotencyKey);

        if (existingLog != null)
        {
            return MapToDto(existingLog);
        }

        // 2. Target user check & Dept scope check
        var toUser = await _dbContext.Users.FindAsync(request.ToUserId);
        if (toUser == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Recipient User with ID {request.ToUserId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && toUser.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only send emails to users within their own department.");
        }

        var template = await _dbContext.EmailTemplates.FindAsync(request.TemplateId);
        if (template == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Email Template with ID {request.TemplateId} not found.");
        }

        // I-03 FIX: Apply placeholders to the email subject and body before logging/sending
        string renderedSubject = ApplyPlaceholders(template.Subject, request.Placeholders);
        string renderedBody = ApplyPlaceholders(template.BodyHtml, request.Placeholders);

        // For Phase 1 stubbing, mark status as Sent synchronously.
        // In Phase 3, this would push to an email queue with the rendered body.
        var log = new EmailLog
        {
            Id = Guid.NewGuid(),
            ToUserId = request.ToUserId,
            TemplateId = request.TemplateId,
            SentById = currentUserId,
            Status = EmailLogStatus.Sent,
            IdempotencyKey = request.IdempotencyKey,
            QueuedAt = DateTime.UtcNow,
            SentAt = DateTime.UtcNow
        };

        _ = renderedSubject; // Reserved for Phase 3 SMTP integration
        _ = renderedBody;    // Reserved for Phase 3 SMTP integration

        _dbContext.EmailLogs.Add(log);
        await _dbContext.SaveChangesAsync();

        return await GetLogByIdAsync(log.Id);
    }

    public async Task<List<EmailLogDto>> GetLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        IQueryable<EmailLog> query = _dbContext.EmailLogs
            .Include(el => el.ToUser)
            .Include(el => el.Template)
            .Include(el => el.SentBy);

        if (currentUserRole == RoleType.HR.ToString())
        {
            query = query.Where(el => el.SentById == currentUserId || el.ToUser.DepartmentId == currentUserDeptId);
        }

        return await query
            .OrderByDescending(el => el.QueuedAt)
            .Select(el => new EmailLogDto(
                el.Id,
                el.ToUserId,
                el.ToUser.Email,
                el.TemplateId,
                el.Template.Name,
                el.SentById,
                el.SentBy.Name,
                el.Status,
                el.IdempotencyKey,
                el.ErrorMessage,
                el.QueuedAt,
                el.SentAt
            ))
            .ToListAsync();
    }

    private async Task<EmailLogDto> GetLogByIdAsync(Guid id)
    {
        var el = await _dbContext.EmailLogs
            .Include(l => l.ToUser)
            .Include(l => l.Template)
            .Include(l => l.SentBy)
            .FirstAsync(l => l.Id == id);

        return MapToDto(el);
    }

    private static EmailLogDto MapToDto(EmailLog el)
    {
        return new EmailLogDto(
            el.Id,
            el.ToUserId,
            el.ToUser.Email,
            el.TemplateId,
            el.Template.Name,
            el.SentById,
            el.SentBy.Name,
            el.Status,
            el.IdempotencyKey,
            el.ErrorMessage,
            el.QueuedAt,
            el.SentAt
        );
    }

    /// <summary>
    /// I-03 FIX: Replaces {{PlaceholderName}} tokens in a template string with the provided values.
    /// Unmatched tokens are left as-is.
    /// </summary>
    private static string ApplyPlaceholders(string template, Dictionary<string, string>? placeholders)
    {
        if (placeholders == null || placeholders.Count == 0)
            return template;

        return Regex.Replace(template, @"\{\{(\w+)\}\}", match =>
        {
            string key = match.Groups[1].Value;
            return placeholders.TryGetValue(key, out var value) ? value : match.Value;
        });
    }
}

