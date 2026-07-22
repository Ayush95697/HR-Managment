using System;

namespace HrSystem.Domain.Entities;

public class TaskAttachment
{
    public Guid Id { get; set; }

    public Guid TaskCardId { get; set; }
    public TaskCard TaskCard { get; set; } = null!;

    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;

    public Guid UploadedById { get; set; }
    public User UploadedBy { get; set; } = null!;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
