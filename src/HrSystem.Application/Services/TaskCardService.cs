using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using HrSystem.Application.Common;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Application.Services;

public class TaskCardService : ITaskCardService
{
    private readonly HrDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public TaskCardService(HrDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task<List<TaskCardDto>> GetCardsByBoardIdAsync(Guid boardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var board = await _dbContext.Boards.FindAsync(boardId);
        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Cannot view cards for a board in another department.");
        }
        else if (currentUserRole == RoleType.Employee.ToString())
        {
            bool isAssigned = await _dbContext.TaskCards.AnyAsync(c => c.BoardId == boardId && c.AssignedToId == currentUserId);
            if (!isAssigned)
            {
                throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Cannot view cards for a board you are not assigned to.");
            }
        }

        return await _dbContext.TaskCards
            .Include(c => c.Column)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .Where(c => c.BoardId == boardId)
            .OrderBy(c => c.Position)
            .Select(c => new TaskCardDto(
                c.Id,
                c.BoardId,
                c.ColumnId,
                c.Column.Name,
                c.AssignedToId,
                c.AssignedTo != null ? c.AssignedTo.Name : null,
                c.Title,
                c.Description,
                c.Priority,
                c.DueDate,
                c.CreatedById,
                // BUG-01 FIX: null guard on CreatedBy in case creator was soft-deleted
                c.CreatedBy != null ? c.CreatedBy.Name : string.Empty,
                c.Position,
                c.RowVersion,
                c.CreatedAt,
                c.UpdatedAt
            ))
            .ToListAsync();
    }

    public async Task<TaskCardDetailDto> GetCardByIdAsync(Guid cardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var card = await _dbContext.TaskCards
            .Include(c => c.Board)
            .Include(c => c.Column)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .Include(c => c.Comments)
                .ThenInclude(com => com.Author)
            .Include(c => c.Attachments)
                .ThenInclude(att => att.UploadedBy)
            .FirstOrDefaultAsync(c => c.Id == cardId);

        if (card == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Task Card with ID {cardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && card.Board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Cannot view cards from another department.");
        }
        else if (currentUserRole == RoleType.Employee.ToString())
        {
            bool isAssigned = await _dbContext.TaskCards.AnyAsync(c => c.BoardId == card.BoardId && c.AssignedToId == currentUserId);
            if (!isAssigned)
            {
                throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Cannot view cards from a board you are not assigned to.");
            }
        }

        var commentDtos = card.Comments
            .OrderBy(com => com.CreatedAt)
            .Select(com => new TaskCommentDto(
                com.Id,
                com.TaskCardId,
                com.AuthorId,
                com.Author?.Name ?? string.Empty,
                com.Body,
                com.CreatedAt
            )).ToList();

        var attachmentDtos = card.Attachments
            .OrderBy(att => att.UploadedAt)
            .Select(att => new TaskAttachmentDto(
                att.Id,
                att.TaskCardId,
                att.FileName,
                att.FileUrl,
                att.UploadedById,
                // BUG-02 FIX: null guard on UploadedBy in case uploader was soft-deleted
                att.UploadedBy?.Name ?? string.Empty,
                att.UploadedAt
            )).ToList();

        return new TaskCardDetailDto(
            card.Id,
            card.BoardId,
            card.ColumnId,
            card.Column.Name,
            card.AssignedToId,
            card.AssignedTo?.Name,
            card.Title,
            card.Description,
            card.Priority,
            card.DueDate,
            card.CreatedById,
            // BUG-01 FIX: null guard
            card.CreatedBy?.Name ?? string.Empty,
            card.Position,
            card.RowVersion,
            card.CreatedAt,
            card.UpdatedAt,
            commentDtos,
            attachmentDtos
        );
    }

    public async Task<TaskCardDto> CreateCardAsync(Guid boardId, CreateTaskCardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var board = await _dbContext.Boards.FindAsync(boardId);
        if (board == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Board with ID {boardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only create cards in their own department.");
        }

        var column = await _dbContext.BoardColumns.FirstOrDefaultAsync(c => c.Id == request.ColumnId && c.BoardId == boardId);
        if (column == null)
        {
            throw new ArgumentException($"Column ID {request.ColumnId} does not belong to Board {boardId}.");
        }

        double lastPosition = await _dbContext.TaskCards
            .Where(c => c.ColumnId == request.ColumnId)
            .Select(c => (double?)c.Position)
            .MaxAsync() ?? 0.0;

        double newPosition = PositionCalculator.CalculateNewEndPosition(lastPosition == 0.0 ? null : lastPosition);

        var card = new TaskCard
        {
            Id = Guid.NewGuid(),
            BoardId = boardId,
            ColumnId = request.ColumnId,
            AssignedToId = request.AssignedToId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            CreatedById = currentUserId,
            Position = newPosition,
            // IsConcurrencyToken (not IsRowVersion) — app manages this value
            RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.TaskCards.Add(card);

        // I-02 FIX: Use JsonSerializer to safely build MetadataJson (prevents JSON injection)
        var metadata = new { title = card.Title };
        var activityLog = new TaskActivityLog
        {
            Id = Guid.NewGuid(),
            TaskCardId = card.Id,
            ActorId = currentUserId,
            ToColumnId = card.ColumnId,
            Action = TaskActivityAction.Created,
            Timestamp = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(metadata)
        };
        _dbContext.TaskActivityLogs.Add(activityLog);

        await _dbContext.SaveChangesAsync();

        return await GetCardDtoByIdInternal(card.Id);
    }

    public async Task<TaskCardDto> PatchCardAsync(Guid cardId, PatchTaskCardRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var card = await _dbContext.TaskCards
            .Include(c => c.Board)
            .Include(c => c.Column)
            .FirstOrDefaultAsync(c => c.Id == cardId);

        if (card == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Task Card with ID {cardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && card.Board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only edit cards in their department.");
        }

        if (currentUserRole == RoleType.Employee.ToString())
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Employees cannot edit card details or move cards.");
        }

        // BUG-04 FIX: Manual concurrency check kept as early-exit guard.
        // Since RowVersion is IsConcurrencyToken (not IsRowVersion), the DB column is app-managed
        // and EF will also verify it in the WHERE clause during SaveChangesAsync.
        if (request.RowVersion == null || request.RowVersion.Length == 0 || !card.RowVersion.SequenceEqual(request.RowVersion))
        {
            throw new DbUpdateConcurrencyException("Stale write detected. The card has been modified by another user.");
        }

        Guid? oldColumnId = card.ColumnId;
        Guid? oldAssignedToId = card.AssignedToId;

        if (request.ColumnId.HasValue && request.ColumnId.Value != card.ColumnId)
        {
            var targetColumn = await _dbContext.BoardColumns.FirstOrDefaultAsync(c => c.Id == request.ColumnId.Value && c.BoardId == card.BoardId);
            if (targetColumn == null)
            {
                throw new ArgumentException("Target column does not belong to the board.");
            }
            card.ColumnId = request.ColumnId.Value;

            if (targetColumn.IsDoneColumn)
            {
                card.CompletedAt = DateTime.UtcNow;
            }
            else
            {
                card.CompletedAt = null;
            }
        }

        if (request.Title != null) card.Title = request.Title;
        if (request.Description != null) card.Description = request.Description;
        if (request.Priority.HasValue) card.Priority = request.Priority.Value;
        if (request.DueDate.HasValue) card.DueDate = request.DueDate.Value;

        // BUG-09 FIX: Support explicit unassignment via ClearAssignee flag
        if (request.ClearAssignee == true)
        {
            card.AssignedToId = null;
        }
        else if (request.AssignedToId.HasValue)
        {
            card.AssignedToId = request.AssignedToId.Value;
        }

        if (request.Position.HasValue) card.Position = request.Position.Value;

        card.UpdatedAt = DateTime.UtcNow;
        // Rotate the concurrency token so next writer must use the new value
        card.RowVersion = Guid.NewGuid().ToByteArray().Take(8).ToArray();

        // Log Activity based on action
        if (oldColumnId != card.ColumnId)
        {
            _dbContext.TaskActivityLogs.Add(new TaskActivityLog
            {
                Id = Guid.NewGuid(),
                TaskCardId = card.Id,
                ActorId = currentUserId,
                FromColumnId = oldColumnId,
                ToColumnId = card.ColumnId,
                Action = TaskActivityAction.Moved,
                Timestamp = DateTime.UtcNow
            });

            if (card.AssignedToId.HasValue)
            {
                var actor = await _dbContext.Users.FindAsync(currentUserId);
                var targetColumnName = (await _dbContext.BoardColumns.FindAsync(card.ColumnId))?.Name ?? "another column";
                await _notificationService.NotifyAsync(
                    recipientId: card.AssignedToId.Value,
                    actorId: currentUserId,
                    type: NotificationType.TaskMoved,
                    message: $"{actor?.Name ?? "Someone"} moved your task to '{targetColumnName}'",
                    taskCardId: card.Id,
                    boardId: card.BoardId);
            }
        }
        else if (oldAssignedToId != card.AssignedToId)
        {
            // I-02 FIX: Safe JSON serialization for assignee metadata
            var assignMeta = new { assignedToId = card.AssignedToId?.ToString() };
            _dbContext.TaskActivityLogs.Add(new TaskActivityLog
            {
                Id = Guid.NewGuid(),
                TaskCardId = card.Id,
                ActorId = currentUserId,
                Action = TaskActivityAction.Assigned,
                Timestamp = DateTime.UtcNow,
                MetadataJson = JsonSerializer.Serialize(assignMeta)
            });

            if (card.AssignedToId.HasValue)
            {
                await _notificationService.NotifyAsync(
                    recipientId: card.AssignedToId.Value,
                    actorId: currentUserId,
                    type: NotificationType.TaskAssigned,
                    message: $"You were assigned a new task: {card.Title}",
                    taskCardId: card.Id,
                    boardId: card.BoardId);
            }
        }
        else
        {
            _dbContext.TaskActivityLogs.Add(new TaskActivityLog
            {
                Id = Guid.NewGuid(),
                TaskCardId = card.Id,
                ActorId = currentUserId,
                Action = TaskActivityAction.Edited,
                Timestamp = DateTime.UtcNow
            });
        }

        await _dbContext.SaveChangesAsync();

        return await GetCardDtoByIdInternal(card.Id);
    }

    public async Task DeleteCardAsync(Guid cardId, Guid currentUserId, string currentUserRole)
    {
        if (currentUserRole != RoleType.Admin.ToString())
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Only Admins can delete cards.");
        }

        var card = await _dbContext.TaskCards.FirstOrDefaultAsync(c => c.Id == cardId);
        if (card == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Task Card with ID {cardId} not found.");
        }

        _dbContext.TaskCards.Remove(card);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<TaskCommentDto> AddCommentAsync(Guid cardId, CreateCommentRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var card = await _dbContext.TaskCards
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == cardId);

        if (card == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Task Card with ID {cardId} not found.");
        }

        if (currentUserRole == RoleType.Employee.ToString() && card.AssignedToId != currentUserId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Employees can only comment on tasks assigned directly to them.");
        }

        var author = await _dbContext.Users.FindAsync(currentUserId);
        if (author == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException("Author user record not found.");
        }

        var comment = new TaskComment
        {
            Id = Guid.NewGuid(),
            TaskCardId = cardId,
            AuthorId = currentUserId,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.TaskComments.Add(comment);

        _dbContext.TaskActivityLogs.Add(new TaskActivityLog
        {
            Id = Guid.NewGuid(),
            TaskCardId = cardId,
            ActorId = currentUserId,
            Action = TaskActivityAction.Commented,
            Timestamp = DateTime.UtcNow
        });

        if (card.AssignedToId.HasValue && card.AssignedToId.Value != currentUserId)
        {
            await _notificationService.NotifyAsync(
                recipientId: card.AssignedToId.Value,
                actorId: currentUserId,
                type: NotificationType.TaskCommented,
                message: $"{author.Name} commented on '{card.Title}'",
                taskCardId: card.Id,
                boardId: card.BoardId);
        }

        if (card.CreatedById != currentUserId && card.CreatedById != card.AssignedToId)
        {
            await _notificationService.NotifyAsync(
                recipientId: card.CreatedById,
                actorId: currentUserId,
                type: NotificationType.TaskCommented,
                message: $"{author.Name} commented on '{card.Title}'",
                taskCardId: card.Id,
                boardId: card.BoardId);
        }

        await _dbContext.SaveChangesAsync();

        return new TaskCommentDto(
            comment.Id,
            comment.TaskCardId,
            comment.AuthorId,
            author.Name,
            comment.Body,
            comment.CreatedAt
        );
    }

    public async Task<List<TaskActivityLogDto>> GetCardActivityLogsAsync(Guid cardId, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var card = await _dbContext.TaskCards
            .Include(c => c.Board)
            .FirstOrDefaultAsync(c => c.Id == cardId);

        if (card == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"Task Card with ID {cardId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && card.Board.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Cannot view activity logs for a card in another department.");
        }
        else if (currentUserRole == RoleType.Employee.ToString())
        {
            bool isAssigned = await _dbContext.TaskCards.AnyAsync(c => c.BoardId == card.BoardId && c.AssignedToId == currentUserId);
            if (!isAssigned)
            {
                throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Cannot view activity logs for a card on a board you are not assigned to.");
            }
        }

        return await _dbContext.TaskActivityLogs
            .Include(al => al.Actor)
                .ThenInclude(a => a.Role)
            .Include(al => al.FromColumn)
            .Include(al => al.ToColumn)
            .Where(al => al.TaskCardId == cardId)
            .OrderByDescending(al => al.Timestamp)
            .Select(al => new TaskActivityLogDto(
                al.Id,
                al.TaskCardId,
                al.ActorId,
                al.Actor.Name,
                al.Actor.Role.Name,
                al.FromColumnId,
                al.FromColumn != null ? al.FromColumn.Name : null,
                al.ToColumnId,
                al.ToColumn != null ? al.ToColumn.Name : null,
                al.Action,
                al.Timestamp,
                al.MetadataJson
            ))
            .ToListAsync();
    }

    private async Task<TaskCardDto> GetCardDtoByIdInternal(Guid cardId)
    {
        var card = await _dbContext.TaskCards
            .Include(c => c.Column)
            .Include(c => c.AssignedTo)
            .Include(c => c.CreatedBy)
            .FirstAsync(c => c.Id == cardId);

        return new TaskCardDto(
            card.Id,
            card.BoardId,
            card.ColumnId,
            card.Column.Name,
            card.AssignedToId,
            card.AssignedTo?.Name,
            card.Title,
            card.Description,
            card.Priority,
            card.DueDate,
            card.CreatedById,
            // BUG-01 FIX: null guard
            card.CreatedBy?.Name ?? string.Empty,
            card.Position,
            card.RowVersion,
            card.CreatedAt,
            card.UpdatedAt
        );
    }
}

