using System;
using HrSystem.Domain.Enums;

namespace HrSystem.Domain.Entities;

public class TaskActivityLog
{
    public Guid Id { get; set; }

    public Guid TaskCardId { get; set; }
    public TaskCard TaskCard { get; set; } = null!;

    public Guid ActorId { get; set; }
    public User Actor { get; set; } = null!;

    public Guid? FromColumnId { get; set; }
    public BoardColumn? FromColumn { get; set; }

    public Guid? ToColumnId { get; set; }
    public BoardColumn? ToColumn { get; set; }

    public TaskActivityAction Action { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public string? MetadataJson { get; set; }
}
