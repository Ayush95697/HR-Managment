using System.Threading.Tasks;
using System.Text.RegularExpressions;
using HrSystem.Application.Assistant.Capabilities.Queries;
using HrSystem.Application.Assistant.ParameterExtraction.Interfaces;
using HrSystem.Application.Interfaces.Repositories;

namespace HrSystem.Application.Assistant.ParameterExtraction.Implementations
{
    public class EmployeeExtractor : IEmployeeExtractor
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUserRepository _userRepository;

        public EmployeeExtractor(IDepartmentRepository departmentRepository, IUserRepository userRepository)
        {
            _departmentRepository = departmentRepository;
            _userRepository = userRepository;
        }

        public async Task<EmployeeQuery> ExtractAsync(string question)
        {
            var query = new EmployeeQuery();

            // Department
            var match = Regex.Match(question, @"(?:in|for) \b([a-zA-Z]+)\b", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                query.DepartmentId = await _departmentRepository.FindIdByNameAsync(match.Groups[1].Value);
            }
            if (query.DepartmentId == null && question.Contains("HR", System.StringComparison.OrdinalIgnoreCase))
            {
                query.DepartmentId = await _departmentRepository.FindIdByNameAsync("HR");
            }

            return query;
        }
    }
}