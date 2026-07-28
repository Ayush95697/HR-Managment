using System.Collections.Generic;
using System.Text;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Services
{
    public class PromptBuilder : IPromptBuilder
    {
        public string BuildPrompt(ChatContext context, IEnumerable<KnowledgeDocument> documents, IEnumerable<ChatMessage> history, string question)
        {
            var sb = new StringBuilder();
            sb.AppendLine("You are an AI assistant.");
            sb.AppendLine($"Role: {context.User.Role}");
            sb.AppendLine($"Name: {context.User.UserName}");
            sb.AppendLine($"Department: {context.User.DepartmentName}");
            sb.AppendLine();
            sb.AppendLine($"Question: {question}");
            
            return sb.ToString();
        }
    }
}
