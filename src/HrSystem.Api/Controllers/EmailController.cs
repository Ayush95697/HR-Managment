using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize]
[Route("api/email")]
public class EmailController : BaseApiController
{
    private readonly IEmailService _emailService;

    public EmailController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpGet("templates")]
    public async Task<ActionResult<List<EmailTemplateDto>>> GetTemplates()
    {
        var templates = await _emailService.GetTemplatesAsync();
        return Ok(templates);
    }

    [HttpPost("templates")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<EmailTemplateDto>> CreateTemplate([FromBody] CreateEmailTemplateRequest request)
    {
        var template = await _emailService.CreateTemplateAsync(request);
        return CreatedAtAction(nameof(GetTemplates), new { id = template.Id }, template);
    }

    [HttpPost("send")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<EmailLogDto>> SendEmail([FromBody] SendEmailRequest request)
    {
        var log = await _emailService.SendEmailAsync(request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Accepted(log);
    }

    [HttpGet("logs")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<List<EmailLogDto>>> GetLogs()
    {
        var logs = await _emailService.GetLogsAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(logs);
    }
}
