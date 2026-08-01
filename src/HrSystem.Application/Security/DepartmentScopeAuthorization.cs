using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

using HrSystem.Domain.Enums;

using Microsoft.AspNetCore.Authorization;

namespace HrSystem.Application.Security;

public class HrSameDepartmentRequirement : IAuthorizationRequirement
{
}

public class HrSameDepartmentHandler : AuthorizationHandler<HrSameDepartmentRequirement, Guid?>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HrSameDepartmentRequirement requirement,
        Guid? targetDepartmentId)
    {
        var userRoleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;

        // Admin bypasses department scope checks
        if (userRoleClaim == RoleType.Admin.ToString())
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // HR user must match department
        if (userRoleClaim == RoleType.HR.ToString())
        {
            var userDeptClaim = context.User.FindFirst("departmentId")?.Value;
            if (Guid.TryParse(userDeptClaim, out var userDeptId))
            {
                if (targetDepartmentId.HasValue && targetDepartmentId.Value == userDeptId)
                {
                    context.Succeed(requirement);
                    return Task.CompletedTask;
                }
            }
        }

        return Task.CompletedTask;
    }
}