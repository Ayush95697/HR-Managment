using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IAuditService
{
    Task<List<TaskActivityLogDto>> GetAuditLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task ClearLogsAsync();
}