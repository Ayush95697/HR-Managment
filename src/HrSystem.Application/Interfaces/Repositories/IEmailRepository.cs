using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface IEmailRepository
{
    Task<List<EmailTemplate>> GetTemplatesAsync();
    Task<EmailTemplate?> GetTemplateByIdAsync(Guid templateId);
    Task AddTemplateAsync(EmailTemplate template);
    Task<EmailLog?> GetLogByIdempotencyKeyAsync(string idempotencyKey);
    Task<EmailLog> GetLogByIdWithDetailsAsync(Guid id);
    Task<List<EmailLog>> GetLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task ClearLogsAsync();
    Task AddLogAsync(EmailLog log);
    Task SaveEmailLogAsync(EmailLog log);
    void RemoveTemplate(EmailTemplate template);
    Task SaveChangesAsync();
}
