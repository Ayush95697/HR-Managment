using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HrSystem.Application.Security;
using HrSystem.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Xunit;

namespace HrSystem.Tests.Unit;

public class DepartmentScopeAuthorizationTests
{
    private readonly HrSameDepartmentHandler _handler = new();

    [Fact]
    public async Task HandleAsync_AdminRole_ShouldSucceedRegardlessOfDepartment()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Role, RoleType.Admin.ToString())
        };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        var requirement = new HrSameDepartmentRequirement();
        var context = new AuthorizationHandlerContext(new[] { requirement }, user, Guid.NewGuid());

        await _handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
    }

    [Fact]
    public async Task HandleAsync_HrRoleSameDepartment_ShouldSucceed()
    {
        var deptId = Guid.NewGuid();
        var claims = new[]
        {
            new Claim(ClaimTypes.Role, RoleType.HR.ToString()),
            new Claim("departmentId", deptId.ToString())
        };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        var requirement = new HrSameDepartmentRequirement();
        var context = new AuthorizationHandlerContext(new[] { requirement }, user, deptId);

        await _handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
    }

    [Fact]
    public async Task HandleAsync_HrRoleDifferentDepartment_ShouldNotSucceed()
    {
        var userDeptId = Guid.NewGuid();
        var targetDeptId = Guid.NewGuid();

        var claims = new[]
        {
            new Claim(ClaimTypes.Role, RoleType.HR.ToString()),
            new Claim("departmentId", userDeptId.ToString())
        };
        var user = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        var requirement = new HrSameDepartmentRequirement();
        var context = new AuthorizationHandlerContext(new[] { requirement }, user, targetDeptId);

        await _handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }
}
