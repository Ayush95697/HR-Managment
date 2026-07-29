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
using HrSystem.Application.Assistant.ResponseStrategies.Interfaces;

namespace HrSystem.Application.Assistant.Services
{
    public class ChatService : IChatService
    {
        private readonly IEnumerable<IContextBuilder> _contextBuilders;
        private readonly IRetriever _retriever;
        private readonly ICapabilityResolver _capabilityResolver;
        private readonly HrSystem.Application.Assistant.IntentRouting.IIntentRouter _intentRouter;
        private readonly IParameterExtractor _parameterExtractor;
        private readonly IResponseStrategyResolver _strategyResolver;

        public ChatService(
            IEnumerable<IContextBuilder> contextBuilders,
            IRetriever retriever,
            ICapabilityResolver capabilityResolver,
            HrSystem.Application.Assistant.IntentRouting.IIntentRouter intentRouter,
            IParameterExtractor parameterExtractor,
            IResponseStrategyResolver strategyResolver)
        {
            _contextBuilders = contextBuilders;
            _retriever = retriever;
            _capabilityResolver = capabilityResolver;
            _intentRouter = intentRouter;
            _parameterExtractor = parameterExtractor;
            _strategyResolver = strategyResolver;
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

            // 4. Resolve Response Strategy
            var mode = _strategyResolver.DetermineMode(request.Message, intent, capabilityResult?.StructuredData);
            var strategy = _strategyResolver.Resolve(mode);

            // 5. Generate and Return Final Response
            // (CapabilityResult can be null if no capability handled it, Strategy will still handle it)
            // If capabilityResult is null, we create a default empty one just to prevent passing null, or we can pass null. 
            // The signature requires CapabilityResult, so we pass an empty one if null.
            return await strategy.ExecuteAsync(capabilityResult ?? new CapabilityResult(), request, context, documents, cancellationToken);
        }
    }
}
