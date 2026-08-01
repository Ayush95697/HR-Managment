using System;
using System.Collections.Generic;

namespace HrSystem.Domain.Entities;

public class Board
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BoardColumn> Columns { get; set; } = new List<BoardColumn>();
    public ICollection<TaskCard> Cards { get; set; } = new List<TaskCard>();
}