using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Exceptions;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Api.Controllers;

[Authorize]
[Route("api/email")]
public class EmailController : BaseApiController
{
    private readonly IEmailService _emailService;
    private readonly IEmailDispatchService _emailDispatchService;

    public EmailController(
        IEmailService emailService,
        IEmailDispatchService emailDispatchService)
    {
        _emailService = emailService;
        _emailDispatchService = emailDispatchService;
    }

    [HttpGet("templates")]
    public async Task<ActionResult<List<EmailTemplateDto>>> GetTemplates()
    {
        var templates = await _emailService.GetTemplatesAsync(CurrentUserId);
        return Ok(templates);
    }

    [HttpPost("templates")]
    [Authorize(Policy = Permissions.CanManageEmails)]
    public async Task<ActionResult<EmailTemplateDto>> CreateTemplate([FromBody] CreateEmailTemplateRequest request)
    {
        var template = await _emailService.CreateTemplateAsync(request, CurrentUserId);
        return CreatedAtAction(nameof(GetTemplates), new { id = template.Id }, template);
    }

    [HttpDelete("templates/{id}")]
    [Authorize(Policy = Permissions.CanManageEmails)]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        await _emailService.DeleteTemplateAsync(id);
        return NoContent();
    }

    [HttpPut("templates/{id}/toggle-quick-access")]
    [HttpPatch("templates/{id}/quick-access")]
    [Authorize(Policy = Permissions.CanManageEmails)]
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
    [HttpPost("outbox")]
    [Authorize(Policy = Permissions.CanManageEmails)]
    public async Task<IActionResult> SendEmail([FromBody] SendEmailRequest request)
    {
        var result = await _emailDispatchService.SendAsync(request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Accepted(result);
    }

    [HttpGet("logs")]
    [Authorize(Policy = Permissions.CanManageEmails)]
    public async Task<ActionResult<List<EmailLogDto>>> GetLogs()
    {
        var logs = await _emailService.GetLogsAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(logs);
    }

    [HttpDelete("logs/clear")]
    [HttpDelete("logs")]
    [Authorize(Policy = Permissions.CanClearEmailLogs)]
    public async Task<IActionResult> ClearLogs()
    {
        await _emailService.ClearLogsAsync();
        return Ok();
    }
}
