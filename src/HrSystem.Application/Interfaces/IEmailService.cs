using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IEmailService
{
    Task<List<EmailTemplateDto>> GetTemplatesAsync(Guid currentUserId);
    Task<EmailTemplateDto> CreateTemplateAsync(CreateEmailTemplateRequest request, Guid currentUserId);
    Task<List<EmailLogDto>> GetLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<EmailLogDto> GetLogByIdAsync(Guid id);
    Task DeleteTemplateAsync(Guid id);
    Task ToggleQuickAccessAsync(Guid id, bool isQuickAccess, Guid currentUserId);
    Task ClearLogsAsync();
}