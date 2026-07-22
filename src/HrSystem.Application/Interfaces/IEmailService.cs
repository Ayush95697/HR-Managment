using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IEmailService
{
    Task<List<EmailTemplateDto>> GetTemplatesAsync();
    Task<EmailTemplateDto> CreateTemplateAsync(CreateEmailTemplateRequest request);
    Task<EmailLogDto> SendEmailAsync(SendEmailRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<List<EmailLogDto>> GetLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
}
