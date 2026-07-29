using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Assistant.ParameterExtraction.Interfaces;

namespace HrSystem.Application.Assistant.Services
{
    public class ChatService : IChatService
    {
        private readonly IEnumerable<IContextBuilder> _contextBuilders;
        private readonly IRetriever _retriever;
        private readonly IPromptBuilder _promptBuilder;
        private readonly ILLMClient _llmClient;
        private readonly ICapabilityResolver _capabilityResolver;
        private readonly HrSystem.Application.Assistant.IntentRouting.IIntentRouter _intentRouter;
        private readonly IParameterExtractor _parameterExtractor;

        public ChatService(
            IEnumerable<IContextBuilder> contextBuilders,
            IRetriever retriever,
            IPromptBuilder promptBuilder,
            ILLMClient llmClient,
            ICapabilityResolver capabilityResolver,
            HrSystem.Application.Assistant.IntentRouting.IIntentRouter intentRouter,
            IParameterExtractor parameterExtractor)
        {
            _contextBuilders = contextBuilders;
            _retriever = retriever;
            _promptBuilder = promptBuilder;
            _llmClient = llmClient;
            _capabilityResolver = capabilityResolver;
            _intentRouter = intentRouter;
            _parameterExtractor = parameterExtractor;
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

            // 2. Capability Resolution via Intent Routing
            var intent = _intentRouter.Route(request.Message);
            
            CapabilityResult? capabilityResult = null;
            if (intent != AssistantIntent.GeneralConversation && intent != AssistantIntent.Unknown)
            {
                var capability = _capabilityResolver.Resolve(intent);
                if (capability != null)
                {
                    var capabilityRequest = await _parameterExtractor.ExtractAsync(user, request.Message, intent);
                    
                    try
                    {
                        capabilityResult = await capability.ExecuteAsync(capabilityRequest, cancellationToken);
                    }
                    catch
                    {
                        capabilityResult = new CapabilityResult
                        {
                            Success = false,
                            CapabilityName = capability.Name,
                            Summary = "I couldn't retrieve the requested information.",
                            StructuredData = null
                        };
                    }
                }
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
