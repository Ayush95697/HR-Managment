using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

namespace HrSystem.Application.Assistant.Services
{
    public class PromptBuilder : IPromptBuilder
    {
        public string BuildPrompt(PromptContext promptContext)
        {
            var context = promptContext.ChatContext;
            var question = promptContext.Question;
            var role = context.User.Role?.ToLower() ?? "employee";
            var promptPath = Path.Combine(System.AppContext.BaseDirectory, "Assistant", "Prompts", $"{role}.txt");
            
            if (!File.Exists(promptPath))
            {
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

            if (promptContext.CapabilityResult != null && promptContext.CapabilityResult.Success)
            {
                sb.AppendLine("=== CAPABILITY RESULT ===");
                sb.AppendLine($"Capability Executed: {promptContext.CapabilityResult.CapabilityName}");
                sb.AppendLine($"Summary: {promptContext.CapabilityResult.Summary}");
                
                if (promptContext.CapabilityResult.StructuredData != null)
                {
                    string json = JsonSerializer.Serialize(promptContext.CapabilityResult.StructuredData, new JsonSerializerOptions { WriteIndented = true });
                    sb.AppendLine("Structured Data:");
                    sb.AppendLine(json);
                }
                
                sb.AppendLine();
                sb.AppendLine("=== STRICT INSTRUCTIONS FOR USING STRUCTURED DATA ===");
                sb.AppendLine("- Use ONLY the provided structured data to answer the question.");
                sb.AppendLine("- Never invent employees.");
                sb.AppendLine("- Never invent departments.");
                sb.AppendLine("- Never invent statistics.");
                sb.AppendLine("- Never invent tasks.");
                sb.AppendLine("- If data is missing, clearly state that the information is unavailable.");
                sb.AppendLine();
            }

            sb.AppendLine("=== USER QUESTION ===");
            sb.AppendLine(question);
            
            return sb.ToString();
        }
    }
}
