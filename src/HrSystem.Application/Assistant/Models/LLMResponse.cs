namespace HrSystem.Application.Assistant.Models
{
    public class LLMResponse
    {
        public string Text { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string FinishReason { get; set; } = string.Empty;
        public int UsageTokens { get; set; }
        public bool Success { get; set; }
    }
}
