using System.Collections.Generic;

namespace HrSystem.Application.Assistant.Models
{
    public class ChatContext
    {
        public CurrentUserContext User { get; set; } = new CurrentUserContext();
        public IEnumerable<KnowledgeDocument> RetrievedDocuments { get; set; } = new List<KnowledgeDocument>();
        public string DynamicContext { get; set; } = string.Empty;
        public string ConversationId { get; set; } = string.Empty;
        public IDictionary<string, string> Metadata { get; set; } = new Dictionary<string, string>();
    }
}