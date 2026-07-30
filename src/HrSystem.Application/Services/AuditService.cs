using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;

namespace HrSystem.Application.Services;

public class AuditService : IAuditService
{
    private readonly IAuditRepository _auditRepository;

    public AuditService(IAuditRepository auditRepository)
    {
        _auditRepository = auditRepository;
    }

    public async Task<List<TaskActivityLogDto>> GetAuditLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var logs = await _auditRepository.GetAuditLogsAsync(currentUserRole, currentUserDeptId);

        return logs
            .Select(al => new TaskActivityLogDto(
                al.Id,
                al.TaskCardId,
                al.ActorId,
                al.Actor.Name,
                al.Actor.Role.Name,
                al.FromColumnId,
                al.FromColumn != null ? al.FromColumn.Name : null,
                al.ToColumnId,
                al.ToColumn != null ? al.ToColumn.Name : null,
                al.Action,
                al.Timestamp,
                al.MetadataJson
            ))
            .ToList();
    }

    public async Task ClearLogsAsync()
    {
        await _auditRepository.ClearLogsAsync();
    }
}
