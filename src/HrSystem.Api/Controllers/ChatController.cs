using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost]
        public async Task<ActionResult<ChatResponse>> Chat([FromBody] ChatRequest request, CancellationToken cancellationToken)
        {
            var userContext = new CurrentUserContext
            {
                UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty,
                UserName = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
                Email = User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                Role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty,
                DepartmentName = User.FindFirst("DepartmentName")?.Value ?? string.Empty
            };

            string? deptIdClaim = User.FindFirst("DepartmentId")?.Value;
            if (!string.IsNullOrEmpty(deptIdClaim))
            {
                userContext.DepartmentId = deptIdClaim;
            }

            IEnumerable<string> permissions = User.FindAll("Permission").Select(c => c.Value);
            userContext.Permissions = permissions;

            var response = await _chatService.ProcessChatAsync(userContext, request, cancellationToken);
            return Ok(response);
        }
    }
}