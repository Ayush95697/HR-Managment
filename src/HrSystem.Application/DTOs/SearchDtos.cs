using System;
using System.Collections.Generic;

namespace HrSystem.Application.DTOs;

public class GlobalSearchResultDto
{
    public List<SearchTaskDto> Tasks { get; set; } = new();
    public List<SearchBoardDto> Boards { get; set; } = new();
    public List<SearchEmployeeDto> Employees { get; set; } = new();
    public List<SearchDepartmentDto> Departments { get; set; } = new();
}

public class SearchTaskDto
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string BoardName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class SearchEmployeeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string? ManagerName { get; set; }
    public bool IsActive { get; set; }
    public string? AvatarUrl { get; set; }
}

public class SearchBoardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? DepartmentName { get; set; }
    public string OwnerName { get; set; } = string.Empty;
}

public class SearchDepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
