using System.Threading.Tasks;
using HrSystem.Application.Assistant.Capabilities.Queries;

namespace HrSystem.Application.Assistant.ParameterExtraction.Interfaces
{
    public interface ITaskExtractor
    {
        Task<TaskQuery> ExtractAsync(string question);
    }

    public interface IDepartmentExtractor
    {
        Task<DepartmentQuery> ExtractAsync(string question);
    }

    public interface IEmployeeExtractor
    {
        Task<EmployeeQuery> ExtractAsync(string question);
    }

    public interface IBoardExtractor
    {
        Task<BoardQuery> ExtractAsync(string question);
    }
}
