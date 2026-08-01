using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Security;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize]
public class BoardsController : BaseApiController
{
    private readonly IBoardService _boardService;

    public BoardsController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BoardDto>>> GetBoards()
    {
        var boards = await _boardService.GetBoardsAsync(CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(boards);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BoardDetailDto>> GetBoardById(Guid id)
    {
        var board = await _boardService.GetBoardByIdAsync(id, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(board);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.CanManageBoards)]
    public async Task<ActionResult<BoardDto>> CreateBoard([FromBody] CreateBoardRequest request)
    {
        var board = await _boardService.CreateBoardAsync(request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return CreatedAtAction(nameof(GetBoardById), new { id = board.Id }, board);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.CanManageBoards)]
    public async Task<ActionResult<BoardDto>> UpdateBoard(Guid id, [FromBody] UpdateBoardRequest request)
    {
        var board = await _boardService.UpdateBoardAsync(id, request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(board);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.CanManageBoards)]
    public async Task<IActionResult> DeleteBoard(Guid id)
    {
        await _boardService.DeleteBoardAsync(id, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return NoContent();
    }

    [HttpPost("{boardId:guid}/columns")]
    [Authorize(Policy = Permissions.CanManageBoards)]
    public async Task<ActionResult<BoardColumnDto>> CreateColumn(Guid boardId, [FromBody] CreateColumnRequest request)
    {
        var column = await _boardService.CreateColumnAsync(boardId, request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(column);
    }
}