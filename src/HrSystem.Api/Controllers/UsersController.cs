using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserSummaryDto>>> GetUsers()
    {
        var users = await _userService.GetUsersAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(users);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserSummaryDto>> GetMe()
    {
        var me = await _userService.GetCurrentUserAsync(CurrentUserId);
        return Ok(me);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserSummaryDto>> GetUserById(Guid id)
    {
        var user = await _userService.GetUserByIdAsync(id, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(user);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserSummaryDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = await _userService.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserSummaryDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userService.UpdateUserAsync(id, request);
        return Ok(user);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SoftDeleteUser(Guid id)
    {
        await _userService.SoftDeleteUserAsync(id);
        return NoContent();
    }
}
