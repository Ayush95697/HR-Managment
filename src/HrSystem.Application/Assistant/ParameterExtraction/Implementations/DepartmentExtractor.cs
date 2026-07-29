using System.Threading.Tasks;
using System.Text.RegularExpressions;
using HrSystem.Application.Assistant.Capabilities.Queries;
using HrSystem.Application.Assistant.ParameterExtraction.Interfaces;
using HrSystem.Application.Interfaces.Repositories;

namespace HrSystem.Application.Assistant.ParameterExtraction.Implementations
{
    public class DepartmentExtractor : IDepartmentExtractor
    {
        private readonly IDepartmentRepository _departmentRepository;

        public DepartmentExtractor(IDepartmentRepository departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        public async Task<DepartmentQuery> ExtractAsync(string question)
        {
            var query = new DepartmentQuery();
            
            var match = Regex.Match(question, @"(?:in|for) \b([a-zA-Z]+)\b", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var name = match.Groups[1].Value;
                query.DepartmentId = await _departmentRepository.FindIdByNameAsync(name);
            }
            
            if (query.DepartmentId == null)
            {
                match = Regex.Match(question, @"\b([a-zA-Z]+)\b department", RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    var name = match.Groups[1].Value;
                    query.DepartmentId = await _departmentRepository.FindIdByNameAsync(name);
                }
            }

            if (query.DepartmentId == null && question.Contains("HR", System.StringComparison.OrdinalIgnoreCase))
            {
                query.DepartmentId = await _departmentRepository.FindIdByNameAsync("HR");
            }

            return query;
        }
    }
}
