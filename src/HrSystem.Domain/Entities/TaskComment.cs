using System;

namespace HrSystem.Domain.Entities;

public class TaskComment
{
    public Guid Id { get; set; }

    public Guid TaskCardId { get; set; }
    public TaskCard TaskCard { get; set; } = null!;

    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}