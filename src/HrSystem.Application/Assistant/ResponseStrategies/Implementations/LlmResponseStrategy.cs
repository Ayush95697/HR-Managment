using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.ResponseStrategies.Interfaces;
using HrSystem.Application.Assistant.ResponseStrategies.Models;

namespace HrSystem.Application.Assistant.ResponseStrategies.Implementations
{
    public class LlmResponseStrategy : IResponseStrategy
    {
        private readonly IPromptBuilder _promptBuilder;
        private readonly ILLMClient _llmClient;

        public LlmResponseStrategy(IPromptBuilder promptBuilder, ILLMClient llmClient)
        {
            _promptBuilder = promptBuilder;
            _llmClient = llmClient;
        }

        public bool CanHandle(ResponseMode mode)
        {
            return mode == ResponseMode.Llm;
        }

        public async Task<ChatResponse> ExecuteAsync(
            CapabilityResult capabilityResult,
            ChatRequest request,
            ChatContext context,
            IEnumerable<KnowledgeDocument> retrievedDocuments,
            CancellationToken cancellationToken)
        {
            var history = new List<ChatMessage>();

            var promptContext = new PromptContext
            {
                ChatContext = context,
                Documents = retrievedDocuments,
                History = history,
                Question = request.Message,
                CapabilityResult = capabilityResult
            };

            var prompt = _promptBuilder.BuildPrompt(promptContext);
            var llmResponse = await _llmClient.GenerateResponseAsync(prompt, cancellationToken);

            return new ChatResponse
            {
                ConversationId = Guid.NewGuid().ToString(),
                Role = "assistant",
                Answer = llmResponse.Text,
                Sources = retrievedDocuments.Select(d => d.Source).Distinct(),
                Metadata = new Dictionary<string, string>
                {
                    { "Model", llmResponse.Model },
                    { "UsageTokens", llmResponse.UsageTokens.ToString() }
                }
            };
        }
    }
}
