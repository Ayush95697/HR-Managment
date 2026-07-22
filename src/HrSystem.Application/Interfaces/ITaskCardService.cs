using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface ITaskCardService
{
    Task<List<TaskCardDto>> GetCardsByBoardIdAsync(Guid boardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<TaskCardDetailDto> GetCardByIdAsync(Guid cardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<TaskCardDto> CreateCardAsync(Guid boardId, CreateTaskCardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<TaskCardDto> PatchCardAsync(Guid cardId, PatchTaskCardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task DeleteCardAsync(Guid cardId, Guid currentUserId, string currentUserRole);
    Task<TaskCommentDto> AddCommentAsync(Guid cardId, CreateCommentRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<List<TaskActivityLogDto>> GetCardActivityLogsAsync(Guid cardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
}
