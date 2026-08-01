using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;
using HrSystem.Application.Exceptions;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;

using Microsoft.Extensions.Logging;

namespace HrSystem.Application.Services;

public class EmailDispatchService : IEmailDispatchService
{
    private readonly IEmailRepository _emailRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailDispatchQueue _dispatchQueue;
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailDispatchService> _logger;

    public EmailDispatchService(
        IEmailRepository emailRepository,
        IUserRepository userRepository,
        IEmailDispatchQueue dispatchQueue,
        IEmailService emailService,
        ILogger<EmailDispatchService> logger)
    {
        _emailRepository = emailRepository;
        _userRepository = userRepository;
        _dispatchQueue = dispatchQueue;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<EmailLogDto> SendAsync(SendEmailRequest request, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        // 1. Idempotency Check (repository abstraction)
        var existingLog = await _emailRepository.GetLogByIdempotencyKeyAsync(request.IdempotencyKey);
        if (existingLog != null)
        {
            return await _emailService.GetLogByIdAsync(existingLog.Id);
        }

        // 2. Dept scope check (business rule)
        var toUser = await _userRepository.GetUserByIdAsync(request.ToUserId);
        if (toUser == null)
        {
            throw new AppNotFoundException($"Recipient User with ID {request.ToUserId} not found.");
        }

        if (currentUserRole == RoleType.HR.ToString() && toUser.DepartmentId != currentUserDeptId)
        {
            throw new AppUnauthorizedException("HR users can only send emails to users within their own department.");
        }

        // 3. Template validation
        var template = await _emailRepository.GetTemplateByIdAsync(request.TemplateId);
        if (template == null)
        {
            throw new AppNotFoundException($"Email Template with ID {request.TemplateId} not found.");
        }

        // 4. Create Queued log row
        var log = new EmailLog
        {
            Id = Guid.NewGuid(),
            ToUserId = request.ToUserId,
            TemplateId = request.TemplateId,
            SentById = currentUserId,
            Status = EmailLogStatus.Queued,
            IdempotencyKey = request.IdempotencyKey,
            QueuedAt = DateTime.UtcNow,
        };

        try
        {
            // This handles the unique constraint violation within the repository
            await _emailRepository.SaveEmailLogAsync(log);
        }
        catch (DuplicateIdempotencyKeyException)
        {
            // Race condition: another request with same key committed first
            var raceWinner = await _emailRepository.GetLogByIdempotencyKeyAsync(request.IdempotencyKey);
            if (raceWinner != null)
            {
                return await _emailService.GetLogByIdAsync(raceWinner.Id);
            }
            throw; // Should not happen
        }

        // 5. Enqueue background job
        _dispatchQueue.EnqueueDispatch(log.Id, request.Placeholders);

        return await _emailService.GetLogByIdAsync(log.Id);
    }
}