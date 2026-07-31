using System;
using HrSystem.Domain.Enums;

namespace HrSystem.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }

    // FK -> User, who sees this notification
    public Guid RecipientId { get; set; }
    public User Recipient { get; set; } = null!;

    // FK -> User, who caused it (nullable for system-generated)
    public Guid? ActorId { get; set; }
    public User? Actor { get; set; }

    public NotificationType Type { get; set; }

    // Pre-rendered text, e.g. "Jane moved your task to 'Done'"
    public string Message { get; set; } = string.Empty;

    // FK -> TaskCard, nullable — deep-link target
    public Guid? TaskCardId { get; set; }
    public TaskCard? TaskCard { get; set; }

    // Denormalized for convenience, avoids a join to build the link
    public Guid? BoardId { get; set; }
    public Board? Board { get; set; }

    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
