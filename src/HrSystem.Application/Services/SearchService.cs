using System;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;

namespace HrSystem.Application.Services;

public class SearchService : ISearchService
{
    private readonly ISearchRepository _searchRepository;

    public SearchService(ISearchRepository searchRepository)
    {
        _searchRepository = searchRepository;
    }

    public async Task<GlobalSearchResultDto> GlobalSearchAsync(string query, Guid currentUserId, string role, Guid? departmentId)
    {
        var result = new GlobalSearchResultDto();

        if (string.IsNullOrWhiteSpace(query))
            return result;

        query = query.ToLower();
        bool isGlobalAdmin = role is "Admin" or "HR";

        result.Tasks = await _searchRepository.SearchTasksAsync(query, isGlobalAdmin, currentUserId, departmentId);
        result.Employees = await _searchRepository.SearchEmployeesAsync(query, isGlobalAdmin, currentUserId, departmentId);
        result.Departments = await _searchRepository.SearchDepartmentsAsync(query, isGlobalAdmin, departmentId);
        result.Boards = await _searchRepository.SearchBoardsAsync(query, isGlobalAdmin, currentUserId, departmentId);

        return result;
    }
}