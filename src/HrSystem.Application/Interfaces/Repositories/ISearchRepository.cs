using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces.Repositories;

public interface ISearchRepository
{
    Task<List<SearchTaskDto>> SearchTasksAsync(string query, bool isGlobalAdmin, Guid currentUserId, Guid? departmentId);
    Task<List<SearchEmployeeDto>> SearchEmployeesAsync(string query, bool isGlobalAdmin, Guid currentUserId, Guid? departmentId);
    Task<List<SearchDepartmentDto>> SearchDepartmentsAsync(string query, bool isGlobalAdmin, Guid? departmentId);
    Task<List<SearchBoardDto>> SearchBoardsAsync(string query, bool isGlobalAdmin, Guid currentUserId, Guid? departmentId);
}