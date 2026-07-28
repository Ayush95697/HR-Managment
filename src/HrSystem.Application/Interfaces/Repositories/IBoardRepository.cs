using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface IBoardRepository
{
    Task<List<Board>> GetBoardsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<Board?> GetBoardByIdWithDetailsAsync(Guid boardId);
    Task<Board?> GetBoardByIdWithFullDetailsAsync(Guid boardId);
    Task<Board?> GetBoardByIdAsync(Guid boardId);
    Task AddAsync(Board board);
    Task DeleteAsync(Board board);
    Task<BoardColumn?> GetColumnByIdWithBoardAsync(Guid columnId);
    Task<BoardColumn?> GetColumnByIdWithCardsAsync(Guid columnId);
    Task AddColumnAsync(BoardColumn column);
    Task DeleteColumnAsync(BoardColumn column);
    Task SaveChangesAsync();
}
