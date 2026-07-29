using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;

namespace HrSystem.Application.Assistant.Services
{
    public class ChatService : IChatService
    {
        private readonly IEnumerable<IContextBuilder> _contextBuilders;
        private readonly IRetriever _retriever;
        private readonly IPromptBuilder _promptBuilder;
        private readonly ILLMClient _llmClient;
        private readonly ICapabilityResolver _capabilityResolver;

        public ChatService(
            IEnumerable<IContextBuilder> contextBuilders,
            IRetriever retriever,
            IPromptBuilder promptBuilder,
            ILLMClient llmClient,
            ICapabilityResolver capabilityResolver)
        {
            _contextBuilders = contextBuilders;
            _retriever = retriever;
            _promptBuilder = promptBuilder;
            _llmClient = llmClient;
            _capabilityResolver = capabilityResolver;
        }

        public async Task<ChatResponse> ProcessChatAsync(CurrentUserContext user, ChatRequest request, CancellationToken cancellationToken)
        {
            // 1. Determine Context Builder based on Role
            var builder = _contextBuilders.FirstOrDefault(b => b.CanHandle(user.Role));
            
            ChatContext context;
            if (builder != null)
            {
                context = await builder.BuildAsync(user, cancellationToken);
            }
            else
            {
                // Fallback context if no specific builder handles the role
                context = new ChatContext { User = user };
            }

            // 2. Capability Resolution
            var matchContext = new CapabilityMatchContext { UserQuestion = request.Message };
            var capability = _capabilityResolver.Resolve(matchContext);

            CapabilityResult? capabilityResult = null;
            if (capability != null)
            {
                var execContext = new CapabilityExecutionContext
                {
                    CurrentUser = user,
                    UserQuestion = request.Message
                };
                capabilityResult = await capability.ExecuteAsync(execContext, cancellationToken);
            }

            // 3. Call Retriever (placeholder)
            var documents = await _retriever.RetrieveAsync(request.Message, context, cancellationToken);
            context.RetrievedDocuments = documents;

            // 4. Call Prompt Builder
            var history = new List<ChatMessage>(); // History will be empty for Phase 1
            
            var promptContext = new PromptContext
            {
                ChatContext = context,
                Documents = documents,
                History = history,
                Question = request.Message,
                CapabilityResult = capabilityResult
            };

            var prompt = _promptBuilder.BuildPrompt(promptContext);

            // 5. Call LLM Client (placeholder)
            var llmResponse = await _llmClient.GenerateResponseAsync(prompt, cancellationToken);

            // 6. Return Response
            return new ChatResponse
            {
                ConversationId = Guid.NewGuid().ToString(),
                Role = "assistant",
                Answer = llmResponse.Text,
                Sources = documents.Select(d => d.Source).Distinct(),
                Metadata = new Dictionary<string, string>
                {
                    { "Model", llmResponse.Model },
                    { "UsageTokens", llmResponse.UsageTokens.ToString() }
                }
            };
        }
    }
}
