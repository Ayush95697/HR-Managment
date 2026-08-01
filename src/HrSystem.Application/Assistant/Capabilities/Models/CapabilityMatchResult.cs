namespace HrSystem.Application.Assistant.Capabilities.Models
{
    public class CapabilityMatchResult
    {
        public bool IsMatch { get; set; }
        public double Confidence { get; set; }
        public string CapabilityName { get; set; } = string.Empty;

        public static CapabilityMatchResult Match(string capabilityName, double confidence = 1.0)
        {
            return new CapabilityMatchResult
            {
                IsMatch = true,
                Confidence = confidence,
                CapabilityName = capabilityName
            };
        }

        public static CapabilityMatchResult NoMatch()
        {
            return new CapabilityMatchResult
            {
                IsMatch = false,
                Confidence = 0
            };
        }
    }
}