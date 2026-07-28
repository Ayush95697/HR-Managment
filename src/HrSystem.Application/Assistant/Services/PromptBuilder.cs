using System.Collections.Generic;
using System.IO;
using System.Text;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Services
{
    public class PromptBuilder : IPromptBuilder
    {
        public string BuildPrompt(ChatContext context, IEnumerable<KnowledgeDocument> documents, IEnumerable<ChatMessage> history, string question)
        {
            var role = context.User.Role?.ToLower() ?? "employee";
            var promptPath = Path.Combine(System.AppContext.BaseDirectory, "Assistant", "Prompts", $"{role}.txt");
            
            // Fallback to employee if specific role file is not found
            if (!File.Exists(promptPath))
            {
                // In ASP.NET the BaseDirectory might be bin folder, but files might not be copied unless configured.
                // Alternatively, we use absolute or relative path from project root.
                // Best practice when not embedded is AppContext.BaseDirectory, provided files are copied to output directory.
                // Let's use a robust path resolution relative to AppContext.BaseDirectory
                promptPath = Path.Combine(System.AppContext.BaseDirectory, "Assistant", "Prompts", "employee.txt");
            }
            
            string systemPrompt = "You are a helpful assistant.";
            if (File.Exists(promptPath))
            {
                systemPrompt = File.ReadAllText(promptPath);
            }

            var sb = new StringBuilder();
            sb.AppendLine("=== SYSTEM INSTRUCTIONS ===");
            sb.AppendLine(systemPrompt);
            sb.AppendLine();
            sb.AppendLine("=== CURRENT USER ===");
            sb.AppendLine($"Name: {context.User.UserName}");
            sb.AppendLine($"Role: {context.User.Role}");
            if (!string.IsNullOrEmpty(context.User.DepartmentName))
            {
                sb.AppendLine($"Department: {context.User.DepartmentName}");
            }
            sb.AppendLine();
            sb.AppendLine("=== USER QUESTION ===");
            sb.AppendLine(question);
            
            return sb.ToString();
        }
    }
}
