using System.Threading.Tasks;
using System.Text.RegularExpressions;
using HrSystem.Application.Assistant.Capabilities.Queries;
using HrSystem.Application.Assistant.ParameterExtraction.Interfaces;
using HrSystem.Application.Interfaces.Repositories;

namespace HrSystem.Application.Assistant.ParameterExtraction.Implementations
{
    public class TaskExtractor : ITaskExtractor
    {
        private readonly IUserRepository _userRepository;
        private readonly IBoardRepository _boardRepository;

        public TaskExtractor(IUserRepository userRepository, IBoardRepository boardRepository)
        {
            _userRepository = userRepository;
            _boardRepository = boardRepository;
        }

        public async Task<TaskQuery> ExtractAsync(string question)
        {
            var query = new TaskQuery();

            if (question.Contains("critical", System.StringComparison.OrdinalIgnoreCase))
                query.Priority = "Critical";
            else if (question.Contains("high", System.StringComparison.OrdinalIgnoreCase))
                query.Priority = "High";
            else if (question.Contains("medium", System.StringComparison.OrdinalIgnoreCase))
                query.Priority = "Medium";
            else if (question.Contains("low", System.StringComparison.OrdinalIgnoreCase))
                query.Priority = "Low";

            if (question.Contains("today", System.StringComparison.OrdinalIgnoreCase))
                query.DueDate = "Today";

            var boardMatch = Regex.Match(question, @"\b([a-zA-Z]+)\b board", RegexOptions.IgnoreCase);
            if (boardMatch.Success)
            {
                query.BoardId = await _boardRepository.FindIdByNameAsync(boardMatch.Groups[1].Value);
            }

            if (query.BoardId == null && question.Contains("Backend", System.StringComparison.OrdinalIgnoreCase))
            {
                query.BoardId = await _boardRepository.FindIdByNameAsync("Backend");
            }

            return query;
        }
    }
}