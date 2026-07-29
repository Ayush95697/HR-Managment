using System.Collections.Generic;

namespace HrSystem.Application.Assistant.Models
{
    public class CurrentUserContext
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public IEnumerable<string> Permissions { get; set; } = new List<string>();
    }
}
