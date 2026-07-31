using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HrSystem.Application.Security;

namespace HrSystem.Api.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;
    private readonly IAvatarService _avatarService;

    public UsersController(IUserService userService, IAvatarService avatarService)
    {
        _userService = userService;
        _avatarService = avatarService;
    }

    // ─── Standard user management (existing) ───────────────────────────────

    [HttpGet]
    public async Task<ActionResult<List<UserSummaryDto>>> GetUsers()
    {
        var users = await _userService.GetUsersAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserSummaryDto>> GetUserById(Guid id)
    {
        var user = await _userService.GetUserByIdAsync(id, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(user);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.CanManageUsers)]
    public async Task<ActionResult<UserSummaryDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        var user = await _userService.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.CanManageUsers)]
    public async Task<ActionResult<UserSummaryDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userService.UpdateUserAsync(id, request);
        return Ok(user);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.CanManageUsers)]
    public async Task<IActionResult> SoftDeleteUser(Guid id)
    {
        await _userService.SoftDeleteUserAsync(id);
        return NoContent();
    }

    // ─── Self-service /me endpoints (all roles) ────────────────────────────

    [HttpGet("me")]
    public async Task<ActionResult<UserSummaryDto>> GetMe()
    {
        var me = await _userService.GetCurrentUserAsync(CurrentUserId);
        return Ok(me);
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserSummaryDto>> UpdateMe([FromBody] UpdateProfileRequest request)
    {
        var updated = await _userService.UpdateProfileAsync(CurrentUserId, request);
        return Ok(updated);
    }

    [HttpPost("me/avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (file.Length > 2 * 1024 * 1024)
            return StatusCode(413, new { message = "File too large. Maximum size is 2MB." });

        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Unsupported file type. Please upload a JPG, PNG, or WebP image." });

        try
        {
            var url = await _avatarService.SaveAvatarAsync(CurrentUserId, file);
            await _userService.UpdateAvatarUrlAsync(CurrentUserId, url);
            return Ok(new { avatarUrl = url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("me/avatar")]
    public async Task<IActionResult> RemoveAvatar()
    {
        await _avatarService.DeleteAvatarAsync(CurrentUserId);
        await _userService.UpdateAvatarUrlAsync(CurrentUserId, null);
        return NoContent();
    }

    [HttpPost("me/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            await _userService.ChangePasswordAsync(CurrentUserId, request);
            return Ok(new { message = "Password updated. Please log in again." });
        }
        catch (HrSystem.Application.Exceptions.AppUnauthorizedException ex)
        {
            return BadRequest(new { message = ex.Message, field = "currentPassword" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message, field = "newPassword" });
        }
    }

    [HttpGet("me/sessions")]
    public async Task<ActionResult<List<SessionDto>>> GetSessions()
    {
        var sessions = await _userService.GetSessionsAsync(CurrentUserId, null);
        return Ok(sessions);
    }

    [HttpDelete("me/sessions/{id:guid}")]
    public async Task<IActionResult> RevokeSession(Guid id)
    {
        await _userService.RevokeSessionAsync(id, CurrentUserId);
        return NoContent();
    }

    [HttpDelete("me/sessions")]
    public async Task<IActionResult> RevokeAllOtherSessions()
    {
        await _userService.RevokeAllOtherSessionsAsync(CurrentUserId, null);
        return NoContent();
    }
}
