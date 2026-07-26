using System;

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
