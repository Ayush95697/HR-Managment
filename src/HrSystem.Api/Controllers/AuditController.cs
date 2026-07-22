using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize(Roles = "HR,Admin")]
[Route("api/audit")]
public class AuditController : BaseApiController
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet("logs")]
    public async Task<ActionResult<List<TaskActivityLogDto>>> GetAuditLogs()
    {
        var logs = await _auditService.GetAuditLogsAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(logs);
    }
}
