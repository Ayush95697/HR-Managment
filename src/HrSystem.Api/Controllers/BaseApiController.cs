using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
        }
    }

    protected string CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

    protected Guid? CurrentUserDeptId
    {
        get
        {
            var claim = User.FindFirst("departmentId")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }
}
