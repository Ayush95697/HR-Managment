using System;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IEmailDispatchService
{
    Task<EmailLogDto> SendAsync(SendEmailRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
}