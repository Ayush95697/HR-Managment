using System;

namespace HrSystem.Application.Assistant.Capabilities.Queries
{
    public class BoardQuery : ICapabilityQuery
    {
        public Guid? BoardId { get; set; }
    }
}