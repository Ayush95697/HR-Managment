using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HrSystem.Api.Controllers;

[Authorize]
public class DepartmentsController : BaseApiController
{
    private readonly IDepartmentService _departmentService;

    public DepartmentsController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DepartmentDto>>> GetDepartments()
    {
        var departments = await _departmentService.GetDepartmentsAsync();
        return Ok(departments);
    }

    // BUG-17 FIX: Added GetDepartmentById so CreatedAtAction has a valid target
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DepartmentDto>> GetDepartmentById(Guid id)
    {
        var departments = await _departmentService.GetDepartmentsAsync();
        var dept = departments.Find(d => d.Id == id);
        if (dept == null) return NotFound();
        return Ok(dept);
    }

    [HttpPost]
    [Authorize(Policy = Permissions.CanManageDepartments)]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment([FromBody] CreateDepartmentRequest request)
    {
        var department = await _departmentService.CreateDepartmentAsync(request);
        // BUG-17 FIX: now points to the correct single-item endpoint
        return CreatedAtAction(nameof(GetDepartmentById), new { id = department.Id }, department);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.CanManageDepartments)]
    public async Task<ActionResult> DeleteDepartment(Guid id)
    {
        await _departmentService.DeleteDepartmentAsync(id);
        return NoContent();
    }
}
