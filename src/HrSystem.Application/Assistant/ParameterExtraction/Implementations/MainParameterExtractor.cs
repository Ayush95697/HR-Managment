using System.Threading.Tasks;

using HrSystem.Application.Assistant.Capabilities.Models;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Assistant.Models;
using HrSystem.Application.Assistant.ParameterExtraction.Interfaces;

namespace HrSystem.Application.Assistant.ParameterExtraction.Implementations
{
    public class MainParameterExtractor : IParameterExtractor
    {
        private readonly ITaskExtractor _taskExtractor;
        private readonly IDepartmentExtractor _departmentExtractor;
        private readonly IEmployeeExtractor _employeeExtractor;
        private readonly IBoardExtractor _boardExtractor;

        public MainParameterExtractor(
            ITaskExtractor taskExtractor,
            IDepartmentExtractor departmentExtractor,
            IEmployeeExtractor employeeExtractor,
            IBoardExtractor boardExtractor)
        {
            _taskExtractor = taskExtractor;
            _departmentExtractor = departmentExtractor;
            _employeeExtractor = employeeExtractor;
            _boardExtractor = boardExtractor;
        }

        public async Task<CapabilityRequest> ExtractAsync(CurrentUserContext user, string question, AssistantIntent intent)
        {
            var request = new CapabilityRequest
            {
                CurrentUser = user,
                OriginalQuestion = question,
                Intent = intent
            };

            switch (intent)
            {
                case AssistantIntent.TaskInformation:
                    request.Query = await _taskExtractor.ExtractAsync(question);
                    break;
                case AssistantIntent.DepartmentInformation:
                    request.Query = await _departmentExtractor.ExtractAsync(question);
                    break;
                case AssistantIntent.EmployeeInformation:
                    request.Query = await _employeeExtractor.ExtractAsync(question);
                    break;
                case AssistantIntent.BoardInformation:
                    request.Query = await _boardExtractor.ExtractAsync(question);
                    break;
            }

            return request;
        }
    }
}