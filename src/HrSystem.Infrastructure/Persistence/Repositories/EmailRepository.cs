using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence.Repositories;

public class EmailRepository : IEmailRepository
{
    private readonly HrDbContext _dbContext;

    public EmailRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<EmailTemplate>> GetTemplatesAsync()
    {
        return await _dbContext.EmailTemplates.ToListAsync();
    }

    public async Task<EmailTemplate?> GetTemplateByIdAsync(Guid templateId)
    {
        return await _dbContext.EmailTemplates.FindAsync(templateId);
    }

    public Task AddTemplateAsync(EmailTemplate template)
    {
        _dbContext.EmailTemplates.Add(template);
        return Task.CompletedTask;
    }

    public async Task<EmailLog?> GetLogByIdempotencyKeyAsync(string idempotencyKey)
    {
        return await _dbContext.EmailLogs
            .Include(el => el.ToUser)
            .Include(el => el.Template)
            .Include(el => el.SentBy)
            .FirstOrDefaultAsync(el => el.IdempotencyKey == idempotencyKey);
    }

    public async Task<EmailLog> GetLogByIdWithDetailsAsync(Guid id)
    {
        return await _dbContext.EmailLogs
            .Include(l => l.ToUser)
            .Include(l => l.Template)
            .Include(l => l.SentBy)
            .FirstAsync(l => l.Id == id);
    }

    public async Task<List<EmailLog>> GetLogsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        IQueryable<EmailLog> query = _dbContext.EmailLogs
            .Include(el => el.ToUser)
            .Include(el => el.Template)
            .Include(el => el.SentBy);

        if (currentUserRole == RoleType.HR.ToString())
        {
            query = query.Where(el => el.SentById == currentUserId || el.ToUser.DepartmentId == currentUserDeptId);
        }

        return await query
            .OrderByDescending(l => l.SentAt)
            .ToListAsync();
    }

    public async Task ClearLogsAsync()
    {
        _dbContext.EmailLogs.RemoveRange(_dbContext.EmailLogs);
        await _dbContext.SaveChangesAsync();
    }

    public async Task AddLogAsync(EmailLog log)
    {
        await _dbContext.EmailLogs.AddAsync(log);
    }

    public void RemoveTemplate(EmailTemplate template)
    {
        _dbContext.EmailTemplates.Remove(template);
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
