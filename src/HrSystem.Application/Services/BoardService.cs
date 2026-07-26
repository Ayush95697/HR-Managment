using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Application.Services;

public class BoardService : IBoardService
{
    private readonly HrDbContext _dbContext;

    public BoardService(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<BoardDto>> GetBoardsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
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
                query = query.Where(b => false); // HR without department sees no boards
            }
            else
            {
                query = query.Where(b => b.DepartmentId == currentUserDeptId.Value);
            }
        }
        else if (currentUserRole == RoleType.Employee.ToString())
        {
            // Employees only see boards WHERE they are assigned to at least one card, regardless of department
            query = query.Where(b => b.Cards.Any(c => c.AssignedToId == currentUserId));
        }

        return await query
            .Select(b => new BoardDto(
                b.Id,
                b.Name,
                b.OwnerId,
                b.Owner.Name,
                b.DepartmentId,
                // BUG-03 FIX: null guard on Department navigation
                b.Department != null ? b.Department.Name : string.Empty,
                b.CreatedAt,
                b.Columns.Count,
                b.Cards.Count
            ))
            .ToListAsync();
    }

    public async Task<BoardDetailDto> GetBoardByIdAsync(Guid boardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        // BUG-15 FIX: Removed the duplicate .Include(b => b.Columns) chain.
        // Use a single Include chain with separate ThenInclude paths.
        var board = await _dbContext.Boards
            .Include(b => b.Owner)
            .Include(b => b.Department)
            .Include(b => b.Columns.OrderBy(c => c.Order))
                .ThenInclude(c => c.Cards.OrderBy(card => card.Position))
                    .ThenInclude(card => card.AssignedTo)
            .Include(b => b.Columns.OrderBy(c => c.Order))
                .ThenInclude(c => c.Cards.OrderBy(card => card.Position))
                    .ThenInclude(card => card.CreatedBy)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        // Scope check
        if (currentUserRole == RoleType.HR.ToString())
        {
            if (board.DepartmentId != currentUserDeptId)
            {
                throw new HrSystem.Application.Exceptions.AppUnauthorizedException("You do not have access to boards in other departments.");
            }
        }
        else if (currentUserRole == RoleType.Employee.ToString())
        {
            bool isAssigned = board.Columns.Any(c => c.Cards.Any(card => card.AssignedToId == currentUserId));
            if (!isAssigned)
            {
                throw new HrSystem.Application.Exceptions.AppUnauthorizedException("You do not have access to this board.");
            }
        }

        var columnDtos = board.Columns
            .OrderBy(c => c.Order)
            .Select(c => new BoardColumnDto(
                c.Id,
                c.BoardId,
                c.Name,
                c.Order,
                c.IsDoneColumn,
                c.Cards
                    .OrderBy(card => card.Position)
                    .Select(card => new TaskCardDto(
                        card.Id,
                        card.BoardId,
                        card.ColumnId,
                        c.Name,
                        card.AssignedToId,
                        card.AssignedTo?.Name,
                        card.Title,
                        card.Description,
                        card.Priority,
                        card.DueDate,
                        card.CreatedById,
                        // BUG-01 FIX (also applies here): null guard on CreatedBy
                        card.CreatedBy?.Name ?? string.Empty,
                        card.Position,
                        card.RowVersion,
                        card.CreatedAt,
                        card.UpdatedAt
                    )).ToList()
            )).ToList();

        return new BoardDetailDto(
            board.Id,
            board.Name,
            board.OwnerId,
            board.Owner.Name,
            board.DepartmentId,
            board.Department?.Name ?? string.Empty,
            board.CreatedAt,
            columnDtos
        );
    }

    public async Task<BoardDto> CreateBoardAsync(CreateBoardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        if (currentUserRole == RoleType.HR.ToString() && request.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only create boards for their own department.");
        }

        var department = await _dbContext.Departments.FindAsync(request.DepartmentId);
        if (department == null)
        {
            throw new ArgumentException($"Department ID {request.DepartmentId} not found.");
        }

        var board = new Board
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            OwnerId = currentUserId,
            DepartmentId = request.DepartmentId,
            CreatedAt = DateTime.UtcNow
        };

        // Add default columns: To Do, In Progress, Done
        board.Columns.Add(new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "To Do", Order = 0 });
        board.Columns.Add(new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "In Progress", Order = 1 });
        board.Columns.Add(new BoardColumn { Id = Guid.NewGuid(), BoardId = board.Id, Name = "Done", Order = 2, IsDoneColumn = true });

        _dbContext.Boards.Add(board);
        await _dbContext.SaveChangesAsync();

        var owner = await _dbContext.Users.FindAsync(currentUserId);

        return new BoardDto(
            board.Id,
            board.Name,
            board.OwnerId,
            owner?.Name ?? string.Empty,
            board.DepartmentId,
            department.Name,
            board.CreatedAt,
            board.Columns.Count,
            0
        );
    }

    public async Task<BoardDto> UpdateBoardAsync(Guid boardId, UpdateBoardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var board = await _dbContext.Boards
            .Include(b => b.Owner)
            .Include(b => b.Department)
            .Include(b => b.Columns)
            .Include(b => b.Cards)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && (board.OwnerId != currentUserId || board.DepartmentId != currentUserDeptId))
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only edit boards they own in their department.");
        }

        board.Name = request.Name;
        await _dbContext.SaveChangesAsync();

        return new BoardDto(
            board.Id,
            board.Name,
            board.OwnerId,
            board.Owner.Name,
            board.DepartmentId,
            board.Department?.Name ?? string.Empty,
            board.CreatedAt,
            board.Columns.Count,
            board.Cards.Count
        );
    }

    public async Task DeleteBoardAsync(Guid boardId)
    {
        var board = await _dbContext.Boards.FirstOrDefaultAsync(b => b.Id == boardId);
        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        _dbContext.Boards.Remove(board);
        await _dbContext.SaveChangesAsync();
    }

    // Columns
    public async Task<BoardColumnDto> CreateColumnAsync(Guid boardId, CreateColumnRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var board = await _dbContext.Boards.FirstOrDefaultAsync(b => b.Id == boardId);
        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only add columns to boards in their department.");
        }

        var column = new BoardColumn
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            Name = request.Name,
            Order = request.Order
        };

        _dbContext.BoardColumns.Add(column);
        await _dbContext.SaveChangesAsync();

        return new BoardColumnDto(column.Id, column.BoardId, column.Name, column.Order, column.IsDoneColumn, new List<TaskCardDto>());
    }

    public async Task<BoardColumnDto> UpdateColumnAsync(Guid columnId, UpdateColumnRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var column = await _dbContext.BoardColumns
            .Include(c => c.Board)
            .Include(c => c.Cards.OrderBy(card => card.Position))
                .ThenInclude(card => card.AssignedTo)
            .Include(c => c.Cards.OrderBy(card => card.Position))
                .ThenInclude(card => card.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == columnId);

        if (column == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Column with ID {columnId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && column.Board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only update columns in their department.");
        }

        column.Name = request.Name;
        column.Order = request.Order;
        if (request.IsDoneColumn.HasValue && request.IsDoneColumn.Value != column.IsDoneColumn)
        {
            column.IsDoneColumn = request.IsDoneColumn.Value;
            var now = DateTime.UtcNow;
            foreach (var card in column.Cards)
            {
                card.CompletedAt = column.IsDoneColumn ? now : null;
            }
        }
        await _dbContext.SaveChangesAsync();

        // BUG-12 FIX: Return the actual cards in the column, not an empty list
        var cardDtos = column.Cards
            .OrderBy(card => card.Position)
            .Select(card => new TaskCardDto(
                card.Id,
                card.BoardId,
                card.ColumnId,
                column.Name,
                card.AssignedToId,
                card.AssignedTo?.Name,
                card.Title,
                card.Description,
                card.Priority,
                card.DueDate,
                card.CreatedById,
                card.CreatedBy?.Name ?? string.Empty,
                card.Position,
                card.RowVersion,
                card.CreatedAt,
                card.UpdatedAt
            )).ToList();

        return new BoardColumnDto(column.Id, column.BoardId, column.Name, column.Order, column.IsDoneColumn, cardDtos);
    }

    public async Task DeleteColumnAsync(Guid columnId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var column = await _dbContext.BoardColumns
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == columnId);

        if (column == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Column with ID {columnId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && column.Board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only delete columns in their department.");
        }

        _dbContext.BoardColumns.Remove(column);
        await _dbContext.SaveChangesAsync();
    }
}

