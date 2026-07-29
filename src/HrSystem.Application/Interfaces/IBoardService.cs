using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IBoardService
{
    Task<List<BoardDto>> GetBoardsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<BoardDetailDto> GetBoardByIdAsync(Guid boardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<BoardDto> CreateBoardAsync(CreateBoardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<BoardDto> UpdateBoardAsync(Guid boardId, UpdateBoardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task DeleteBoardAsync(Guid boardId);

    // Columns
    Task<BoardColumnDto> CreateColumnAsync(Guid boardId, CreateColumnRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<BoardColumnDto> UpdateColumnAsync(Guid columnId, UpdateColumnRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task DeleteColumnAsync(Guid columnId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    
    Task<List<BoardStatisticsDto>> GetBoardStatisticsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
}
