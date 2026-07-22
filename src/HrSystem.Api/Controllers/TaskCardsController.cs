using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize]
[Route("api")]
public class TaskCardsController : BaseApiController
{
    private readonly ITaskCardService _cardService;

    public TaskCardsController(ITaskCardService cardService)
    {
        _cardService = cardService;
    }

    [HttpGet("boards/{boardId:guid}/cards")]
    public async Task<ActionResult<List<TaskCardDto>>> GetCardsByBoard(Guid boardId)
    {
        var cards = await _cardService.GetCardsByBoardIdAsync(boardId, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(cards);
    }

    [HttpPost("boards/{boardId:guid}/cards")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<TaskCardDto>> CreateCard(Guid boardId, [FromBody] CreateTaskCardRequest request)
    {
        var card = await _cardService.CreateCardAsync(boardId, request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return CreatedAtAction(nameof(GetCardById), new { id = card.Id }, card);
    }

    [HttpGet("cards/{id:guid}")]
    public async Task<ActionResult<TaskCardDetailDto>> GetCardById(Guid id)
    {
        var card = await _cardService.GetCardByIdAsync(id, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(card);
    }

    [HttpPatch("cards/{id:guid}")]
    [Authorize(Roles = "HR,Admin")]
    public async Task<ActionResult<TaskCardDto>> PatchCard(Guid id, [FromBody] PatchTaskCardRequest request)
    {
        var card = await _cardService.PatchCardAsync(id, request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(card);
    }

    [HttpDelete("cards/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCard(Guid id)
    {
        await _cardService.DeleteCardAsync(id, CurrentUserId, CurrentUserRole);
        return NoContent();
    }

    [HttpPost("cards/{id:guid}/comments")]
    public async Task<ActionResult<TaskCommentDto>> AddComment(Guid id, [FromBody] CreateCommentRequest request)
    {
        var comment = await _cardService.AddCommentAsync(id, request, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(comment);
    }

    [HttpGet("cards/{id:guid}/activity")]
    public async Task<ActionResult<List<TaskActivityLogDto>>> GetCardActivity(Guid id)
    {
        var logs = await _cardService.GetCardActivityLogsAsync(id, CurrentUserId, CurrentUserRole, CurrentUserDeptId);
        return Ok(logs);
    }
}
