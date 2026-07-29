using System;

namespace HrSystem.Application.Assistant.Capabilities.Queries
{
    public class TaskQuery : ICapabilityQuery
    {
        public string? Priority { get; set; }
        public string? DueDate { get; set; }
        public Guid? EmployeeId { get; set; }
        public Guid? BoardId { get; set; }
    }
}
