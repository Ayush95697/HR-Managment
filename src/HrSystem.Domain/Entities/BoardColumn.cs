using System;
using System.Collections.Generic;

namespace HrSystem.Domain.Entities;

public class BoardColumn
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public Board Board { get; set; } = null!;

    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool IsDoneColumn { get; set; } = false;

    public ICollection<TaskCard> Cards { get; set; } = new List<TaskCard>();
}
