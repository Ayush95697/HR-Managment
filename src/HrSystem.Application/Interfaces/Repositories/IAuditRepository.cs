using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface IAuditRepository
{
    Task<List<TaskActivityLog>> GetAuditLogsAsync(string currentUserRole, Guid? currentUserDeptId);
    Task ClearLogsAsync();
}