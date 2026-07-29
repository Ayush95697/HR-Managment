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
    private readonly INotificationService _notificationService;

    public EmailService(HrDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task<List<EmailTemplateDto>> GetTemplatesAsync(Guid currentUserId)
    {
        var entities = await _dbContext.EmailTemplates
            .Where(t => t.CreatedByUserId == currentUserId)
            .ToListAsync();
        return entities.Select(t => new EmailTemplateDto(
            t.Id,
            t.Name,
            t.Subject,
            t.BodyHtml,
            string.IsNullOrEmpty(t.PlaceholderSchemaJson) 
                ? null 
                : System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(t.PlaceholderSchemaJson, (System.Text.Json.JsonSerializerOptions?)null),
            t.IsQuickAccess,
            t.CreatedByUserId
        )).ToList();
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

        _dbContext.EmailTemplates.Add(template);
        await _dbContext.SaveChangesAsync();

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
            ))
            .ToListAsync();
    }

    public async Task<EmailLogDto> GetLogByIdAsync(Guid id)
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
        var template = await _dbContext.EmailTemplates.FindAsync(id);
        if (template != null)
        {
            _dbContext.EmailTemplates.Remove(template);
            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task ToggleQuickAccessAsync(Guid id, bool isQuickAccess, Guid currentUserId)
    {
        var entity = await _dbContext.EmailTemplates.FindAsync(id);
        if (entity == null || entity.CreatedByUserId != currentUserId)
        {
            throw new KeyNotFoundException("Template not found or access denied.");
        }

        entity.IsQuickAccess = isQuickAccess;
        await _dbContext.SaveChangesAsync();
    }
}

