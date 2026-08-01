using System;
using System.Collections.Generic;

namespace HrSystem.Application.DTOs;

public record DepartmentDto(Guid Id, string Name, int UserCount);

public record CreateDepartmentRequest(string Name);

public record BoardDto(
    Guid Id,
    string Name,
    Guid OwnerId,
    string OwnerName,
    Guid DepartmentId,
    string DepartmentName,
    DateTime CreatedAt,
    int ColumnCount,
    int CardCount
);

public record CreateBoardRequest(string Name, Guid DepartmentId);

public record UpdateBoardRequest(string Name);

public record BoardColumnDto(
    Guid Id,
    Guid BoardId,
    string Name,
    int Order,
    bool IsDoneColumn,
    List<TaskCardDto> Cards
);

public record CreateColumnRequest(string Name, int Order);

public record UpdateColumnRequest(string Name, int? Order, bool? IsDoneColumn);

public record BoardDetailDto(
    Guid Id,
    string Name,
    Guid OwnerId,
    string OwnerName,
    Guid DepartmentId,
    string DepartmentName,
    DateTime CreatedAt,
    List<BoardColumnDto> Columns
);
