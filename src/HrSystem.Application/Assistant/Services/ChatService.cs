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
using Microsoft.Extensions.Logging;

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
        private readonly Microsoft.Extensions.Logging.ILogger<ChatService> _logger;

        public ChatService(
            IEnumerable<IContextBuilder> contextBuilders,
            IRetriever retriever,
            ICapabilityResolver capabilityResolver,
            HrSystem.Application.Assistant.IntentRouting.IIntentRouter intentRouter,
            IParameterExtractor parameterExtractor,
            IResponseStrategyResolver strategyResolver,
            Microsoft.Extensions.Logging.ILogger<ChatService> logger)
        {
            _contextBuilders = contextBuilders;
            _retriever = retriever;
            _capabilityResolver = capabilityResolver;
            _intentRouter = intentRouter;
            _parameterExtractor = parameterExtractor;
            _strategyResolver = strategyResolver;
            _logger = logger;
        }

        public async Task<ChatResponse> ProcessChatAsync(CurrentUserContext user, ChatRequest request, CancellationToken cancellationToken)
        {
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

            AssistantIntent intent = _intentRouter.Route(request.Message);
            _logger.LogInformation("AI Assistant request processed for User {UserId}. Intent determined: {Intent}", user.UserId, intent);

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
                        _logger.LogInformation("AI Assistant capability {CapabilityName} executed successfully for User {UserId}.", capability.Name, user.UserId);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "AI Assistant capability {CapabilityName} failed for User {UserId}.", capability.Name, user.UserId);
                        capabilityResult = new CapabilityResult
                        {
                            Success = false,
                            CapabilityName = capability.Name,
                            Summary = "Unable to retrieve the requested information.",
                            StructuredData = null
                        };
                    }
                }
            }

            var documents = await _retriever.RetrieveAsync(request.Message, context, cancellationToken);
            context.RetrievedDocuments = documents;

            var mode = _strategyResolver.DetermineMode(request.Message, intent, capabilityResult?.StructuredData);
            var strategy = _strategyResolver.Resolve(mode);

            return await strategy.ExecuteAsync(capabilityResult ?? new CapabilityResult(), request, context, documents, cancellationToken);
        }
    }
}