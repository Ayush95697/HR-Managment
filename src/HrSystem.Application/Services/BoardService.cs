using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;

using Microsoft.Extensions.Logging;

namespace HrSystem.Application.Services;

public class BoardService : IBoardService
{
    private readonly IBoardRepository _boardRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IUserRepository _userRepository;
    private readonly Microsoft.Extensions.Logging.ILogger<BoardService> _logger;

    public BoardService(IBoardRepository boardRepository, IDepartmentRepository departmentRepository, IUserRepository userRepository, Microsoft.Extensions.Logging.ILogger<BoardService> logger)
    {
        _boardRepository = boardRepository;
        _departmentRepository = departmentRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<List<BoardDto>> GetBoardsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var boards = await _boardRepository.GetBoardsAsync(currentUserId, currentUserRole, currentUserDeptId);

        return boards
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
            .ToList();
    }

    public async Task<BoardDetailDto> GetBoardByIdAsync(Guid boardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        // BUG-15 FIX: Removed the duplicate .Include(b => b.Columns) chain.
        // Use a single Include chain with separate ThenInclude paths.
        var board = await _boardRepository.GetBoardByIdWithDetailsAsync(boardId);

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

        var department = await _departmentRepository.GetByIdAsync(request.DepartmentId);
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

        await _boardRepository.AddAsync(board);
        await _boardRepository.SaveChangesAsync();

        _logger.LogInformation("Board created successfully: {BoardId} with name '{BoardName}' in Department {DepartmentId}", board.Id, board.Name, board.DepartmentId);

        var owner = await _userRepository.GetUserByIdAsync(currentUserId);

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
        var board = await _boardRepository.GetBoardByIdWithFullDetailsAsync(boardId);

        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && (board.OwnerId != currentUserId || board.DepartmentId != currentUserDeptId))
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only edit boards they own in their department.");
        }

        board.Name = request.Name;
        await _boardRepository.SaveChangesAsync();

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

    public async Task DeleteBoardAsync(Guid boardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var board = await _boardRepository.GetBoardByIdAsync(boardId);
        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && (board.OwnerId != currentUserId || board.DepartmentId != currentUserDeptId))
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only delete boards they own in their department.");
        }

        await _boardRepository.DeleteAsync(board);
        await _boardRepository.SaveChangesAsync();
    }

    // Columns
    public async Task<BoardColumnDto> CreateColumnAsync(Guid boardId, CreateColumnRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var board = await _boardRepository.GetBoardByIdAsync(boardId);
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

        await _boardRepository.AddColumnAsync(column);
        await _boardRepository.SaveChangesAsync();

        return new BoardColumnDto(column.Id, column.BoardId, column.Name, column.Order, column.IsDoneColumn, new List<TaskCardDto>());
    }

    public async Task<BoardColumnDto> UpdateColumnAsync(Guid columnId, UpdateColumnRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var column = await _boardRepository.GetColumnByIdWithCardsAsync(columnId);

        if (column == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Column with ID {columnId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && column.Board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only update columns in their department.");
        }

        column.Name = request.Name;
        if (request.Order.HasValue)
        {
            column.Order = request.Order.Value;
        }
        if (request.IsDoneColumn.HasValue && request.IsDoneColumn.Value != column.IsDoneColumn)
        {
            column.IsDoneColumn = request.IsDoneColumn.Value;
            var now = DateTime.UtcNow;
            foreach (var card in column.Cards)
            {
                card.CompletedAt = column.IsDoneColumn ? now : null;
            }
        }
        await _boardRepository.SaveChangesAsync();

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
        var column = await _boardRepository.GetColumnByIdWithBoardAsync(columnId);

        if (column == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Column with ID {columnId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && column.Board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only delete columns in their department.");
        }

        await _boardRepository.DeleteColumnAsync(column);
        await _boardRepository.SaveChangesAsync();
    }

    public async Task<List<BoardStatisticsDto>> GetBoardStatisticsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId, HrSystem.Application.Assistant.Capabilities.Queries.BoardQuery? query = null)
    {
        // Enforce RBAC
        if (currentUserRole == RoleType.Employee.ToString())
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Employees cannot view overall board statistics.");
        }

        Guid? departmentFilter = currentUserRole == RoleType.HR.ToString() ? currentUserDeptId : null;

        return await _boardRepository.GetBoardStatisticsAsync(departmentFilter, query);
    }
}