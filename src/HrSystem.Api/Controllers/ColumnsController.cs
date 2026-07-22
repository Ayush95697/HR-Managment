using System;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize(Roles = "HR,Admin")]
public class ColumnsController : BaseApiController
{
    private readonly IBoardService _boardService;

    public ColumnsController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BoardColumnDto>> UpdateColumn(Guid id, [FromBody] UpdateColumnRequest request)
    {
        var column = await _boardService.UpdateColumnAsync(id, request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(column);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteColumn(Guid id)
    {
        await _boardService.DeleteColumnAsync(id, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return NoContent();
    }
}
