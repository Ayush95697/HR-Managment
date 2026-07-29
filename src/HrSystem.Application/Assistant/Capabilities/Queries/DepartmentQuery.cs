using System;

namespace HrSystem.Application.Assistant.Capabilities.Queries
{
    public class DepartmentQuery : ICapabilityQuery
    {
        public Guid? DepartmentId { get; set; }
    }
}
