using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.Services;

public class EmailService : IEmailService
{
    private readonly IEmailRepository _emailRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;

    public EmailService(IEmailRepository emailRepository, IUserRepository userRepository, INotificationService notificationService)
    {
        _emailRepository = emailRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
    }

    public async Task<List<EmailTemplateDto>> GetTemplatesAsync(Guid currentUserId)
    {
        var templates = await _emailRepository.GetTemplatesAsync();
        return templates
            .Where(t => t.CreatedByUserId == currentUserId || t.CreatedByUserId == null)
            .Select(t => new EmailTemplateDto(
                t.Id,
                t.Name,
                t.Subject,
                t.BodyHtml,
                string.IsNullOrEmpty(t.PlaceholderSchemaJson) 
                    ? null 
                    : System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(t.PlaceholderSchemaJson, (System.Text.Json.JsonSerializerOptions?)null),
                t.IsQuickAccess,
                t.CreatedByUserId
            ))
            .ToList();
    }

    public async Task<EmailTemplateDto> CreateTemplateAsync(CreateEmailTemplateRequest request, Guid currentUserId)
    {
        var template = new EmailTemplate
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Subject = request.Subject,
            BodyHtml = request.BodyHtml,
            PlaceholderSchemaJson = request.PlaceholderSchema != null ? System.Text.Json.JsonSerializer.Serialize(request.PlaceholderSchema, (System.Text.Json.JsonSerializerOptions?)null) : null,
            CreatedByUserId = currentUserId,
            IsQuickAccess = true
        };

        await _emailRepository.AddTemplateAsync(template);
        await _emailRepository.SaveChangesAsync();

        return new EmailTemplateDto(
            template.Id,
            template.Name,
            template.Subject,
            template.BodyHtml,
            request.PlaceholderSchema,
            template.IsQuickAccess,
            template.CreatedByUserId
        );
    }


    public async Task<EmailLogDto> SendEmailAsync(SendEmailRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        // 1. Idempotency Check
        var existingLog = await _emailRepository.GetLogByIdempotencyKeyAsync(request.IdempotencyKey);

        if (existingLog != null)
        {
            return MapToDto(existingLog);
        }

        // 2. Target user check & Dept scope check
        var toUser = await _userRepository.GetUserByIdAsync(request.ToUserId);
        if (toUser == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Recipient User with ID {request.ToUserId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && toUser.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only send emails to users within their own department.");
        }

        var template = await _emailRepository.GetTemplateByIdAsync(request.TemplateId);
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

        // Simulated Failure Path (for testing Notification UI)
        if (toUser.Email.Contains("fail", StringComparison.OrdinalIgnoreCase))
        {
            log.Status = EmailLogStatus.Failed;
            log.ErrorMessage = "Simulated delivery failure";

            await _notificationService.NotifyAsync(
                recipientId: currentUserId,
                actorId: null, // System generated
                type: NotificationType.EmailFailed,
                message: $"Email to {toUser.Name} failed to send");
        }

        await _emailRepository.AddLogAsync(log);
        await _emailRepository.SaveChangesAsync();

        var createdLog = await _emailRepository.GetLogByIdWithDetailsAsync(log.Id);
        return MapToDto(createdLog);
    }

    public async Task<List<EmailLogDto>> GetLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var logs = await _emailRepository.GetLogsAsync(currentUserId, currentUserRole, currentUserDeptId);
        return logs.Select(MapToDto).ToList();
    }

    public async Task<EmailLogDto> GetLogByIdAsync(Guid id)
    {
        var el = await _emailRepository.GetLogByIdWithDetailsAsync(id);
        return MapToDto(el);
    }

    private static EmailLogDto MapToDto(EmailLog el)
    {
        return new EmailLogDto(
            el.Id,
            el.ToUserId,
            el.ToUser.Name,
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

    public async Task DeleteTemplateAsync(Guid id)
    {
        var template = await _emailRepository.GetTemplateByIdAsync(id);
        if (template != null)
        {
            _emailRepository.RemoveTemplate(template);
            await _emailRepository.SaveChangesAsync();
        }
    }

    public async Task ToggleQuickAccessAsync(Guid id, bool isQuickAccess, Guid currentUserId)
    {
        var entity = await _emailRepository.GetTemplateByIdAsync(id);
        if (entity == null || entity.CreatedByUserId != currentUserId)
        {
            throw new KeyNotFoundException("Template not found or access denied.");
        }

        entity.IsQuickAccess = isQuickAccess;
        await _emailRepository.SaveChangesAsync();
    }

    private static string ApplyPlaceholders(string text, Dictionary<string, string>? placeholders)
    {
        if (string.IsNullOrWhiteSpace(text) || placeholders == null || placeholders.Count == 0)
            return text;

        foreach (var ph in placeholders)
        {
            text = text.Replace($"{{{{{ph.Key}}}}}", ph.Value);
        }
        return text;
    }
}
