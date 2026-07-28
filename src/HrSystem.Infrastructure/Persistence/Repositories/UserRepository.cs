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

public class UserRepository : IUserRepository
{
    private readonly HrDbContext _dbContext;

    public UserRepository(HrDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User?> GetUserByEmailWithDetailsAsync(string email)
    {
        string normalizedEmail = email.Trim().ToLower();
        return await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
    }

    public async Task RemoveStaleRefreshTokensAsync(Guid userId)
    {
        var staleTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && (rt.RevokedAt != null || rt.ExpiresAt <= DateTime.UtcNow))
            .ToListAsync();
        _dbContext.RefreshTokens.RemoveRange(staleTokens);
    }

    public Task AddRefreshTokenAsync(RefreshToken token)
    {
        _dbContext.RefreshTokens.Add(token);
        return Task.CompletedTask;
    }

    public async Task<RefreshToken?> GetRefreshTokenWithDetailsAsync(string tokenHash)
    {
        return await _dbContext.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.Role)
            .Include(rt => rt.User)
                .ThenInclude(u => u.Department)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash)
    {
        return await _dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);
    }

    public async Task<List<User>> GetUsersAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        IQueryable<User> query = _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department);

        if (currentUserRole == RoleType.HR.ToString())
        {
            query = query.Where(u => u.DepartmentId == currentUserDeptId);
        }
        else if (currentUserRole == RoleType.Employee.ToString())
        {
            query = query.Where(u => u.Id == currentUserId);
        }

        return await query.ToListAsync();
    }

    public async Task<User?> GetUserByIdWithDetailsAsync(Guid id)
    {
        return await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        string normalizedEmail = email.Trim().ToLower();
        return await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
    }

    public async Task<bool> ExistsByEmailExceptIdAsync(string email, Guid excludeId)
    {
        string normalizedEmail = email.Trim().ToLower();
        return await _dbContext.Users.AnyAsync(u => u.Id != excludeId && u.Email.ToLower() == normalizedEmail);
    }

    public async Task<bool> HrExistsInDepartmentAsync(Guid departmentId)
    {
        return await _dbContext.Users.AnyAsync(u => u.RoleId == (int)RoleType.HR && u.DepartmentId == departmentId);
    }

    public async Task<bool> HrExistsInDepartmentExceptIdAsync(Guid departmentId, Guid excludeId)
    {
        return await _dbContext.Users.AnyAsync(u => u.Id != excludeId && u.RoleId == (int)RoleType.HR && u.DepartmentId == departmentId);
    }

    public async Task<User?> GetHrInDepartmentAsync(Guid departmentId)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.RoleId == (int)RoleType.HR && u.DepartmentId == departmentId);
    }

    public async Task<User?> GetHrInDepartmentExceptIdAsync(Guid departmentId, Guid excludeId)
    {
        return await _dbContext.Users.FirstOrDefaultAsync(u => u.Id != excludeId && u.RoleId == (int)RoleType.HR && u.DepartmentId == departmentId);
    }

    public async Task<Role?> GetRoleByIdAsync(int id)
    {
        return await _dbContext.Roles.FindAsync(id);
    }

    public Task AddAsync(User user)
    {
        _dbContext.Users.Add(user);
        return Task.CompletedTask;
    }

    public async Task<List<RefreshToken>> GetActiveRefreshTokensAsync(Guid userId)
    {
        return await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync();
    }

    public async Task<RefreshToken?> GetRefreshTokenByIdAndUserAsync(Guid sessionId, Guid userId)
    {
        return await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Id == sessionId && rt.UserId == userId);
    }

    public async Task<List<RefreshToken>> GetActiveRefreshTokensExceptAsync(Guid userId, Guid? excludeTokenId)
    {
        return await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.Id != excludeTokenId)
            .ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}
