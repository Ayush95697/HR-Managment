using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Security;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Application.Services;

public class UserService : IUserService
{
    private readonly HrDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(HrDbContext dbContext, IPasswordHasher passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserSummaryDto>> GetUsersAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
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

        return await query
            .Select(u => new UserSummaryDto(
                u.Id,
                u.Name,
                u.Email,
                u.RoleId,
                u.Role.Name,
                u.DepartmentId,
                u.Department != null ? u.Department.Name : null,
                u.ManagerId,
                u.IsActive
            ))
            .ToListAsync();
    }

    public async Task<UserSummaryDto> GetUserByIdAsync(Guid id, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var user = await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"User with ID {id} not found.");
        }

        // Scope check
        if (currentUserRole == RoleType.HR.ToString() && user.DepartmentId != currentUserDeptId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("HR users can only access users within their own department.");
        }
        if (currentUserRole == RoleType.Employee.ToString() && user.Id != currentUserId)
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Employees can only view their own user details.");
        }

        return new UserSummaryDto(
            user.Id,
            user.Name,
            user.Email,
            user.RoleId,
            user.Role.Name,
            user.DepartmentId,
            user.Department?.Name,
            user.ManagerId,
            user.IsActive
        );
    }

    public async Task<UserSummaryDto> GetCurrentUserAsync(Guid currentUserId)
    {
        var user = await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == currentUserId);

        if (user == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException("Current user record not found.");
        }

        return new UserSummaryDto(
            user.Id,
            user.Name,
            user.Email,
            user.RoleId,
            user.Role.Name,
            user.DepartmentId,
            user.Department?.Name,
            user.ManagerId,
            user.IsActive
        );
    }

    public async Task<UserSummaryDto> CreateUserAsync(CreateUserRequest request)
    {
        // BUG-05 FIX: Case-insensitive email duplicate check
        string normalizedEmail = request.Email.Trim().ToLower();
        if (await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        {
            throw new InvalidOperationException($"User with email '{request.Email}' already exists.");
        }

        var role = await _dbContext.Roles.FindAsync(request.RoleId);
        if (role == null)
        {
            throw new ArgumentException($"Role ID {request.RoleId} is invalid.");
        }

        if (request.DepartmentId.HasValue && !await _dbContext.Departments.AnyAsync(d => d.Id == request.DepartmentId.Value))
        {
            throw new ArgumentException($"Department ID {request.DepartmentId} is invalid.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            RoleId = request.RoleId,
            DepartmentId = request.DepartmentId,
            ManagerId = request.ManagerId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync();

        return await GetUserByIdAsync(user.Id, user.Id, RoleType.Admin.ToString(), null);
    }

    public async Task<UserSummaryDto> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"User with ID {id} not found.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ArgumentException("Email is required.");
        }

        // BUG-06 FIX: Case-insensitive email duplicate check on update
        string normalizedEmail = request.Email.Trim().ToLower();
        if (!string.Equals(user.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase) &&
            await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        {
            throw new InvalidOperationException($"User with email '{request.Email}' already exists.");
        }

        user.Name = request.Name;
        user.Email = normalizedEmail;
        user.RoleId = request.RoleId;
        user.DepartmentId = request.DepartmentId;
        user.ManagerId = request.ManagerId;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        return await GetUserByIdAsync(user.Id, user.Id, RoleType.Admin.ToString(), null);
    }

    public async Task SoftDeleteUserAsync(Guid id)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"User with ID {id} not found.");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
    }
}

