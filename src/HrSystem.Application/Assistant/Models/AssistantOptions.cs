namespace HrSystem.Application.Assistant.Models
{
    public class AssistantOptions
    {
        public const string SectionName = "Assistant";

        public string Provider { get; set; } = string.Empty;
        public string Endpoint { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public double Temperature { get; set; } = 0.3;
        public int MaxTokens { get; set; } = 2048;
    }
}
