using System;
using System.Collections.Generic;

namespace HrSystem.Application.DTOs;

public record TaskVelocityDto(DateTime Bucket, int Count);

public record DepartmentDistributionDto(string Department, int HeadCount);

public record WorkloadBalanceDto(Guid UserId, string UserName, int High, int Critical);

public record ActivityFeedItemDto
{
    public Guid? Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Kind { get; set; } = string.Empty;
}

public record CriticalTasksSummaryDto(int CriticalTasksCount, List<string> AssignedEmployees);
public record DepartmentStatisticsDto(Guid DepartmentId, string DepartmentName, int EmployeeCount, int OpenTasks, int CompletedTasks);
public record EmployeeStatisticsDto(int TotalEmployees, Dictionary<string, int> EmployeesByDepartment);
public record BoardStatisticsDto(Guid BoardId, string BoardName, int TotalColumns, int OpenCards, int CompletedCards);
