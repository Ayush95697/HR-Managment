using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface ISearchService
{
    Task<GlobalSearchResultDto> GlobalSearchAsync(string query, Guid currentUserId, string role, Guid? departmentId);
}