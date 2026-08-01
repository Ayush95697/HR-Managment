using System;
using System.Collections.Generic;
using System.Linq;

using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Assistant.ResponseStrategies.Interfaces;
using HrSystem.Application.Assistant.ResponseStrategies.Models;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Assistant.ResponseStrategies.Implementations
{
    public class ResponseStrategyResolver : IResponseStrategyResolver
    {
        private readonly IEnumerable<IResponseStrategy> _strategies;

        public ResponseStrategyResolver(IEnumerable<IResponseStrategy> strategies)
        {
            _strategies = strategies;
        }

        public ResponseMode DetermineMode(string question, AssistantIntent intent, object? structuredData)
        {
            if (string.IsNullOrWhiteSpace(question)) return ResponseMode.Llm;

            var q = question.ToLowerInvariant();

            // If question explicitly asks for analytical processing
            if (q.Contains("summarize") || q.Contains("summary") ||
                q.Contains("explain") || q.Contains("why") ||
                q.Contains("compare") || q.Contains("trend") ||
                q.Contains("recommend") || q.Contains("analysis"))
            {
                return ResponseMode.Llm;
            }

            // Based on DTO pattern matching, if it's a simple return type
            if (structuredData is List<TaskCardDto> ||
                structuredData is EmployeeStatisticsDto ||
                structuredData is List<BoardStatisticsDto> ||
                structuredData is List<DepartmentStatisticsDto> ||
                structuredData is CriticalTasksSummaryDto)
            {
                return ResponseMode.Template;
            }

            // Default to LLM
            return ResponseMode.Llm;
        }

        public IResponseStrategy Resolve(ResponseMode mode)
        {
            var strategy = _strategies.FirstOrDefault(s => s.CanHandle(mode));
            if (strategy == null)
            {
                throw new InvalidOperationException($"No response strategy found for mode {mode}");
            }
            return strategy;
        }
    }
}