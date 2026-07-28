using System.Collections.Generic;

namespace HrSystem.Application.Assistant.Models
{
    public class ChatResponse
    {
        public string ConversationId { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public IEnumerable<string> Sources { get; set; } = new List<string>();
        public IDictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
}
