using System.Collections.Generic;
using HrSystem.Application.Assistant.Capabilities.Models;

namespace HrSystem.Application.Assistant.Models
{
    public class PromptContext
    {
        public ChatContext ChatContext { get; set; } = new();
        public IEnumerable<KnowledgeDocument> Documents { get; set; } = new List<KnowledgeDocument>();
        public IEnumerable<ChatMessage> History { get; set; } = new List<ChatMessage>();
        public string Question { get; set; } = string.Empty;
        
        // Context from capability execution
        public CapabilityResult? CapabilityResult { get; set; }
    }
}
