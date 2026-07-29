using System;

namespace HrSystem.Application.Assistant.Capabilities.Queries
{
    public class EmployeeQuery : ICapabilityQuery
    {
        public Guid? DepartmentId { get; set; }
        public Guid? EmployeeId { get; set; }
    }
}
