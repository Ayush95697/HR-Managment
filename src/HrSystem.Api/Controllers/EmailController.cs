using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using HrSystem.Application.DTOs;
using HrSystem.Application.Exceptions;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Jobs;
using HrSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Api.Controllers;

[Authorize]
[Route("api/email")]
public class EmailController : BaseApiController
{
    private readonly IEmailService _emailService;
    private readonly HrDbContext _dbContext;
    private readonly IBackgroundJobClient _backgroundJobClient;

    public EmailController(
        IEmailService emailService,
        HrDbContext dbContext,
        IBackgroundJobClient backgroundJobClient)
    {
        _emailService = emailService;
        _dbContext = dbContext;
        _backgroundJobClient = backgroundJobClient;
    }

    [HttpGet("templates")]
    public async Task<ActionResult<List<EmailTemplateDto>>> GetTemplates()
    {
        var templates = await _emailService.GetTemplatesAsync(CurrentUserId);
        return Ok(templates);
    }

    [HttpPost("templates")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<EmailTemplateDto>> CreateTemplate([FromBody] CreateEmailTemplateRequest request)
    {
        var template = await _emailService.CreateTemplateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetTemplates), new { id = template.Id }, template);
    }

    [HttpDelete("templates/{id}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        await _emailService.DeleteTemplateAsync(id);
        return NoContent();
    }

    [HttpPut("templates/{id}/toggle-quick-access")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> ToggleQuickAccess(Guid id, [FromQuery] bool isQuickAccess)
    {
        try
        {
            await _emailService.ToggleQuickAccessAsync(id, isQuickAccess, CurrentUserId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("send")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<IActionResult> SendEmail([FromBody] SendEmailRequest request)
    {
        // 1. Dept scope check (inline — HR can only email users in own dept)
        var toUser = await _dbContext.Users.FindAsync(request.ToUserId)
            ?? throw new AppNotFoundException($"Recipient User with ID {request.ToUserId} not found.");

        if (CurrentUserRole == "HR" && toUser.DepartmentId != CurrentUserDeptId)
            throw new AppUnauthorizedException("HR users can only send emails to users within their own department.");

        // 2. Idempotency pre-check (soft check — DB constraint is the real guard)
        var existing = await _dbContext.EmailLogs
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.IdempotencyKey == request.IdempotencyKey);

        if (existing != null)
            return Accepted(await _emailService.GetLogByIdAsync(existing.Id));

        // 3. Template validation
        var template = await _dbContext.EmailTemplates.FindAsync(request.TemplateId)
            ?? throw new AppNotFoundException($"Email Template with ID {request.TemplateId} not found.");

        // 4. Create Queued log row
        var log = new EmailLog
        {
            Id = Guid.NewGuid(),
            ToUserId = request.ToUserId,
            TemplateId = request.TemplateId,
            SentById = CurrentUserId,
            Status = EmailLogStatus.Queued,
            IdempotencyKey = request.IdempotencyKey,
            QueuedAt = DateTime.UtcNow,
        };

        try
        {
            _dbContext.EmailLogs.Add(log);
            await _dbContext.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            // Race condition: another request with same key committed first
            var raceWinner = await _dbContext.EmailLogs
                .AsNoTracking()
                .FirstAsync(l => l.IdempotencyKey == request.IdempotencyKey);
            return Accepted(await _emailService.GetLogByIdAsync(raceWinner.Id));
        }

        // 5. Enqueue Hangfire job
        _backgroundJobClient.Enqueue<EmailDispatchJob>(
            job => job.SendAsync(log.Id, request.Placeholders, CancellationToken.None));

        return Accepted(await _emailService.GetLogByIdAsync(log.Id));
    }

    [HttpGet("logs")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<List<EmailLogDto>>> GetLogs()
    {
        var logs = await _emailService.GetLogsAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(logs);
    }

    [HttpDelete("logs/clear")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ClearLogs()
    {
        await _emailService.ClearLogsAsync();
        return Ok();
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
        => ex.InnerException?.Message.Contains("UNIQUE") == true
        || ex.InnerException?.Message.Contains("unique") == true
        || ex.InnerException?.Message.Contains("duplicate") == true;
}
