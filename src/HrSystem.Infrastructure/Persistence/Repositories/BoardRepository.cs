using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class BoardRepository : IBoardRepository
{
    private readonly HrDbContext _dbContext;

    public BoardRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Board>> GetBoardsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        IQueryable<Board> query = _dbContext.Boards
            .Include(b => b.Owner)
            .Include(b => b.Department)
            .Include(b => b.Columns)
            .Include(b => b.Cards);

        if (currentUserRole == RoleType.HR.ToString())
        {
            if (!currentUserDeptId.HasValue)
            {
                query = query.Where(b => false);
            }
            else
            {
                query = query.Where(b => b.DepartmentId == currentUserDeptId.Value);
            }
        }
        else if (currentUserRole == RoleType.Employee.ToString())
        {
            query = query.Where(b => b.Cards.Any(c => c.AssignedToId == currentUserId));
        }

        return await query.ToListAsync();
    }

    public async Task<Board?> GetBoardByIdWithDetailsAsync(Guid boardId)
    {
        return await _dbContext.Boards
            .Include(b => b.Owner)
            .Include(b => b.Department)
            .Include(b => b.Columns.OrderBy(c => c.Order))
                .ThenInclude(c => c.Cards.OrderBy(card => card.Position))
                    .ThenInclude(card => card.AssignedTo)
            .Include(b => b.Columns.OrderBy(c => c.Order))
                .ThenInclude(c => c.Cards.OrderBy(card => card.Position))
                    .ThenInclude(card => card.CreatedBy)
            .FirstOrDefaultAsync(b => b.Id == boardId);
    }

    public async Task<Board?> GetBoardByIdWithFullDetailsAsync(Guid boardId)
    {
        return await _dbContext.Boards
            .Include(b => b.Owner)
            .Include(b => b.Department)
            .Include(b => b.Columns)
            .Include(b => b.Cards)
            .FirstOrDefaultAsync(b => b.Id == boardId);
    }

    public async Task<Board?> GetBoardByIdAsync(Guid boardId)
    {
        return await _dbContext.Boards.FirstOrDefaultAsync(b => b.Id == boardId);
    }

    public Task AddAsync(Board board)
    {
        _dbContext.Boards.Add(board);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Board board)
    {
        _dbContext.Boards.Remove(board);
        return Task.CompletedTask;
    }

    public async Task<BoardColumn?> GetColumnByIdWithBoardAsync(Guid columnId)
    {
        return await _dbContext.BoardColumns
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == columnId);
    }

    public async Task<BoardColumn?> GetColumnByIdWithCardsAsync(Guid columnId)
    {
        return await _dbContext.BoardColumns
            .Include(c => c.Board)
            .Include(c => c.Cards.OrderBy(card => card.Position))
                .ThenInclude(card => card.AssignedTo)
            .Include(c => c.Cards.OrderBy(card => card.Position))
                .ThenInclude(card => card.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == columnId);
    }

    public Task AddColumnAsync(BoardColumn column)
    {
        _dbContext.BoardColumns.Add(column);
        return Task.CompletedTask;
    }

    public Task DeleteColumnAsync(BoardColumn column)
    {
        _dbContext.BoardColumns.Remove(column);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
