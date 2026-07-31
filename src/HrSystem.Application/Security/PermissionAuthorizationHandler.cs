using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HrSystem.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace HrSystem.Application.Security;

public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var userRoleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userRoleClaim))
        {
            return Task.CompletedTask;
        }

        bool hasPermission = false;

        // Admin has all permissions in this system
        if (userRoleClaim == RoleType.Admin.ToString())
        {
            hasPermission = true;
        }
        else if (userRoleClaim == RoleType.HR.ToString())
        {
            // HR permissions map
            var hrPermissions = new[]
            {
                Permissions.CanManageBoards,
                Permissions.CanManageTasks,
                Permissions.CanManageEmails,
                Permissions.CanViewAudit,
                Permissions.CanViewDashboard
            };

            if (hrPermissions.Contains(requirement.Permission))
            {
                hasPermission = true;
            }
        }

        if (hasPermission)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
