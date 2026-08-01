using System;
using System.Collections.Generic;

namespace HrSystem.Domain.Entities;

public class Department
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Board> Boards { get; set; } = new List<Board>();
}