using System.Threading.Tasks;
using System.Text.RegularExpressions;
using HrSystem.Application.Assistant.Capabilities.Queries;
using HrSystem.Application.Assistant.ParameterExtraction.Interfaces;
using HrSystem.Application.Interfaces.Repositories;

namespace HrSystem.Application.Assistant.ParameterExtraction.Implementations
{
    public class BoardExtractor : IBoardExtractor
    {
        private readonly IBoardRepository _boardRepository;

        public BoardExtractor(IBoardRepository boardRepository)
        {
            _boardRepository = boardRepository;
        }

        public async Task<BoardQuery> ExtractAsync(string question)
        {
            var query = new BoardQuery();

            var match = Regex.Match(question, @"\b([a-zA-Z]+)\b board", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                query.BoardId = await _boardRepository.FindIdByNameAsync(match.Groups[1].Value);
            }

            if (query.BoardId == null && question.Contains("Backend", System.StringComparison.OrdinalIgnoreCase))
            {
                query.BoardId = await _boardRepository.FindIdByNameAsync("Backend");
            }

            return query;
        }
    }
}