using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Models;

using Microsoft.Extensions.Options;

namespace HrSystem.Application.Assistant.Nvidia
{
    public class NvidiaNimClient : ILLMClient
    {
        private readonly HttpClient _httpClient;
        private readonly AssistantOptions _options;
        private readonly string? _apiKey;

        public NvidiaNimClient(IHttpClientFactory httpClientFactory, IOptions<AssistantOptions> options)
        {
            _httpClient = httpClientFactory.CreateClient("NvidiaNimClient");
            _options = options.Value;
            _apiKey = Environment.GetEnvironmentVariable("NVIDIA_API_KEY");
        }

        public async Task<LLMResponse> GenerateResponseAsync(string prompt, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                throw new InvalidOperationException("NVIDIA_API_KEY environment variable is missing.");
            }

            var requestPayload = new NvidiaChatRequest
            {
                Model = _options.Model,
                Temperature = _options.Temperature,
                MaxTokens = _options.MaxTokens
            };

            // Using the prompt string as the "user" message 
            // since PromptBuilder concatenated everything into a single string.
            requestPayload.Messages.Add(new NvidiaChatMessage { Role = "user", Content = prompt });

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, _options.Endpoint);
            requestMessage.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);
            requestMessage.Content = JsonContent.Create(requestPayload);

            HttpResponseMessage responseMessage;
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(TimeSpan.FromSeconds(15));
                responseMessage = await _httpClient.SendAsync(requestMessage, cts.Token);
            }
            catch (HttpRequestException ex)
            {
                throw new InvalidOperationException("Network failure while calling the LLM API.", ex);
            }
            catch (TaskCanceledException ex)
            {
                throw new InvalidOperationException("The LLM API request timed out (NVIDIA is not responding).", ex);
            }

            if (!responseMessage.IsSuccessStatusCode)
            {
                var statusCode = (int)responseMessage.StatusCode;
                if (statusCode == 401)
                {
                    throw new UnauthorizedAccessException("The API key provided for the LLM API is invalid or unauthorized.");
                }
                else if (statusCode == 429)
                {
                    throw new InvalidOperationException("Rate limit exceeded for the LLM API. Please try again later.");
                }
                else
                {
                    throw new InvalidOperationException($"The LLM API returned an error: {statusCode}");
                }
            }

            NvidiaChatResponse? chatResponse;
            try
            {
                var responseStream = await responseMessage.Content.ReadAsStreamAsync(cancellationToken);
                chatResponse = await JsonSerializer.DeserializeAsync<NvidiaChatResponse>(responseStream, cancellationToken: cancellationToken);
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException("Failed to parse the response from the LLM API.", ex);
            }

            if (chatResponse == null || chatResponse.Choices == null || chatResponse.Choices.Count == 0)
            {
                throw new InvalidOperationException("The LLM API returned an empty or invalid response structure.");
            }

            var choice = chatResponse.Choices[0];

            return new LLMResponse
            {
                Text = choice.Message?.Content ?? string.Empty,
                Model = _options.Model,
                FinishReason = choice.FinishReason ?? "unknown",
                UsageTokens = chatResponse.Usage?.TotalTokens ?? 0,
                Success = true
            };
        }
    }
}