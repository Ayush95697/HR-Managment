using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.ResponseStrategies.Interfaces;
using HrSystem.Application.Assistant.ResponseStrategies.Models;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Assistant.ResponseStrategies.Implementations
{
    public class TemplateResponseStrategy : IResponseStrategy
    {
        public bool CanHandle(ResponseMode mode)
        {
            return mode == ResponseMode.Template;
        }

        public Task<ChatResponse> ExecuteAsync(
            CapabilityResult capabilityResult, 
            ChatRequest request, 
            ChatContext context, 
            IEnumerable<KnowledgeDocument> retrievedDocuments, 
            CancellationToken cancellationToken)
        {
            var responseText = GenerateResponse(capabilityResult.StructuredData);

            return Task.FromResult(new ChatResponse
            {
                ConversationId = Guid.NewGuid().ToString(), // Should be consistent, but creating a new one for now as in old code
                Role = "assistant",
                Answer = responseText,
                Sources = retrievedDocuments.Select(d => d.Source).Distinct(),
                Metadata = new Dictionary<string, string>
                {
                    { "Model", "TemplateEngine" },
                    { "UsageTokens", "0" }
                }
            });
        }

        private string GenerateResponse(object? structuredData)
        {
            if (structuredData == null)
            {
                return "I couldn't find any specific data for that request.";
            }

            return structuredData switch
            {
                List<TaskCardDto> tasks => FormatTasks(tasks),
                EmployeeStatisticsDto empStats => FormatEmployeeStats(empStats),
                List<BoardStatisticsDto> boardStats => FormatBoardStats(boardStats),
                List<DepartmentStatisticsDto> deptStats => FormatDepartmentStats(deptStats),
                CriticalTasksSummaryDto criticalStats => FormatCriticalTasks(criticalStats),
                _ => "Here is the information you requested." // Fallback
            };
        }

        private string FormatTasks(List<TaskCardDto> tasks)
        {
            if (!tasks.Any()) return "There are no tasks to display.";

            var sb = new StringBuilder();
            sb.AppendLine($"Here are the {tasks.Count} tasks:");
            foreach (var task in tasks)
            {
                sb.AppendLine($"- **{task.Title}** ({task.Priority}) - Due: {task.DueDate?.ToString("d") ?? "None"} - Assignee: {task.AssignedToName ?? "Unassigned"}");
            }
            return sb.ToString();
        }

        private string FormatEmployeeStats(EmployeeStatisticsDto stats)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"**Total Employees:** {stats.TotalEmployees}");
            if (stats.EmployeesByDepartment != null && stats.EmployeesByDepartment.Any())
            {
                sb.AppendLine("Breakdown by Department:");
                foreach (var kvp in stats.EmployeesByDepartment)
                {
                    sb.AppendLine($"- {kvp.Key}: {kvp.Value}");
                }
            }
            return sb.ToString();
        }

        private string FormatBoardStats(List<BoardStatisticsDto> stats)
        {
            if (!stats.Any()) return "No board statistics found.";

            var sb = new StringBuilder();
            sb.AppendLine("Here are the board statistics:");
            foreach (var board in stats)
            {
                sb.AppendLine($"- **{board.BoardName}**: {board.OpenCards} Active Tasks, {board.CompletedCards} Completed Tasks.");
            }
            return sb.ToString();
        }

        private string FormatDepartmentStats(List<DepartmentStatisticsDto> stats)
        {
            if (!stats.Any()) return "No department statistics found.";

            var sb = new StringBuilder();
            sb.AppendLine("Here are the department statistics:");
            foreach (var dept in stats)
            {
                sb.AppendLine($"- **{dept.DepartmentName}**: {dept.EmployeeCount} Employees, {dept.OpenTasks} Active Tasks.");
            }
            return sb.ToString();
        }

        private string FormatCriticalTasks(CriticalTasksSummaryDto stats)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"There are **{stats.CriticalTasksCount}** critical tasks.");
            if (stats.AssignedEmployees != null && stats.AssignedEmployees.Any())
            {
                sb.AppendLine($"They are assigned to: {string.Join(", ", stats.AssignedEmployees)}.");
            }
            return sb.ToString();
        }
    }
}
