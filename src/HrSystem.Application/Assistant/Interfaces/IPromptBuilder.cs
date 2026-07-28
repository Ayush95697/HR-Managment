using System.Collections.Generic;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Interfaces
{
    /// <summary>
    /// Interface for building the final LLM prompt.
    /// </summary>
    public interface IPromptBuilder
    {
        string BuildPrompt(ChatContext context, IEnumerable<KnowledgeDocument> documents, IEnumerable<ChatMessage> history, string question);
    }
}
