using System;
using System.Threading.Tasks;

using HrSystem.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize]
public class SearchController : BaseApiController
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    [HttpGet]
    public async Task<IActionResult> GlobalSearch([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Ok(new
            {
                Tasks = Array.Empty<object>(),
                Boards = Array.Empty<object>(),
                Employees = Array.Empty<object>(),
                Departments = Array.Empty<object>()
            });
        }

        var result = await _searchService.GlobalSearchAsync(
            q,
            CurrentUserId,
            CurrentUserRole,
            CurrentUserDeptId
        );

        return Ok(result);
    }
}