using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Application.Security;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;

namespace HrSystem.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUserRepository userRepository, IDepartmentRepository departmentRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _departmentRepository = departmentRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserSummaryDto>> GetUsersAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var users = await _userRepository.GetUsersAsync(currentUserId, currentUserRole, currentUserDeptId);

        return users
            .Select(u => new UserSummaryDto(
                u.Id,
                u.Name,
                u.Email,
                u.RoleId,
                u.Role.Name,
                u.DepartmentId,
                u.Department != null ? u.Department.Name : null,
                u.ManagerId,
                u.IsActive,
                u.AvatarUrl,
                u.ThemePreference,
                u.EmailNotificationsEnabled
            ))
            .ToList();
    }

    public async Task<UserSummaryDto> GetUserByIdAsync(Guid id, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId)
    {
        var user = await _userRepository.GetUserByIdWithDetailsAsync(id);

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

        return MapToDto(user);
    }

    public async Task<UserSummaryDto> GetCurrentUserAsync(Guid currentUserId)
    {
        var user = await _userRepository.GetUserByIdWithDetailsAsync(currentUserId);

        if (user == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException("Current user record not found.");
        }

        return MapToDto(user);
    }

    public async Task<UserSummaryDto> CreateUserAsync(CreateUserRequest request)
    {
        // BUG-05 FIX: Case-insensitive email duplicate check
        if (await _userRepository.ExistsByEmailAsync(request.Email))
        {
            throw new InvalidOperationException($"User with email '{request.Email}' already exists.");
        }

        var role = await _userRepository.GetRoleByIdAsync(request.RoleId);
        if (role == null)
        {
            throw new ArgumentException($"Role ID {request.RoleId} is invalid.");
        }

        if (request.DepartmentId.HasValue && !await _departmentRepository.ExistsAsync(request.DepartmentId.Value))
        {
            throw new ArgumentException($"Department ID {request.DepartmentId} is invalid.");
        }

        Guid? managerId = request.ManagerId;

        if (request.RoleId == (int)RoleType.HR && request.DepartmentId.HasValue)
        {
            bool hrExists = await _userRepository.HrExistsInDepartmentAsync(request.DepartmentId.Value);
            if (hrExists)
            {
                throw new InvalidOperationException("A department can only have one HR user.");
            }
        }
        else if (request.RoleId == (int)RoleType.Employee && request.DepartmentId.HasValue)
        {
            var hrUser = await _userRepository.GetHrInDepartmentAsync(request.DepartmentId.Value);
            managerId = hrUser?.Id;
        }

        string normalizedEmail = request.Email.Trim().ToLower();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            RoleId = request.RoleId,
            DepartmentId = request.DepartmentId,
            ManagerId = managerId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return await GetUserByIdAsync(user.Id, user.Id, RoleType.Admin.ToString(), null);
    }

    public async Task<UserSummaryDto> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
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
            await _userRepository.ExistsByEmailExceptIdAsync(request.Email, id))
        {
            throw new InvalidOperationException($"User with email '{request.Email}' already exists.");
        }

        Guid? managerId = request.ManagerId;

        if (request.RoleId == (int)RoleType.HR && request.DepartmentId.HasValue)
        {
            bool hrExists = await _userRepository.HrExistsInDepartmentExceptIdAsync(request.DepartmentId.Value, id);
            if (hrExists)
            {
                throw new InvalidOperationException("A department can only have one HR user.");
            }
        }
        else if (request.RoleId == (int)RoleType.Employee && request.DepartmentId.HasValue)
        {
            var hrUser = await _userRepository.GetHrInDepartmentExceptIdAsync(request.DepartmentId.Value, id);
            managerId = hrUser?.Id;
        }

        user.Name = request.Name;
        user.Email = normalizedEmail;
        user.RoleId = request.RoleId;
        user.DepartmentId = request.DepartmentId;
        user.ManagerId = managerId;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();

        return await GetUserByIdAsync(user.Id, user.Id, RoleType.Admin.ToString(), null);
    }

    public async Task SoftDeleteUserAsync(Guid id)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
        if (user == null)
        {
            throw new HrSystem.Application.Exceptions.AppNotFoundException($"User with ID {id} not found.");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();
    }

    // ─── Self-service /me methods ───────────────────────────────────────────

    public async Task<UserSummaryDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _userRepository.GetUserByIdWithDetailsAsync(userId);

        if (user == null)
            throw new HrSystem.Application.Exceptions.AppNotFoundException("User not found.");

        var validThemes = new[] { "Light", "Dark", "System" };
        if (!validThemes.Contains(request.ThemePreference))
            throw new ArgumentException("Invalid theme preference. Must be 'Light', 'Dark', or 'System'.");

        user.Name = request.Name.Trim();
        user.ThemePreference = request.ThemePreference;
        user.EmailNotificationsEnabled = request.EmailNotificationsEnabled;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task UpdateAvatarUrlAsync(Guid userId, string? avatarUrl)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
            throw new HrSystem.Application.Exceptions.AppNotFoundException("User not found.");

        user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user == null)
            throw new HrSystem.Application.Exceptions.AppNotFoundException("User not found.");

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Current password is incorrect.");

        if (request.NewPassword.Length < 8)
            throw new ArgumentException("New password must be at least 8 characters.");

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        // Revoke ALL refresh tokens — forces re-login on every device
        var tokens = await _userRepository.GetActiveRefreshTokensAsync(userId);

        foreach (var token in tokens)
            token.RevokedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();
    }

    public async Task<List<SessionDto>> GetSessionsAsync(Guid userId, Guid? currentTokenId)
    {
        var sessions = await _userRepository.GetActiveRefreshTokensAsync(userId);

        return sessions.Select(s => new SessionDto(
            s.Id,
            s.CreatedAt,
            s.ExpiresAt,
            s.Id == currentTokenId
        )).ToList();
    }

    public async Task RevokeSessionAsync(Guid sessionId, Guid ownerUserId)
    {
        var token = await _userRepository.GetRefreshTokenByIdAndUserAsync(sessionId, ownerUserId);

        if (token == null)
            throw new HrSystem.Application.Exceptions.AppNotFoundException("Session not found.");

        token.RevokedAt = DateTime.UtcNow;
        await _userRepository.SaveChangesAsync();
    }

    public async Task RevokeAllOtherSessionsAsync(Guid userId, Guid? currentTokenId)
    {
        var tokens = await _userRepository.GetActiveRefreshTokensExceptAsync(userId, currentTokenId);

        foreach (var token in tokens)
            token.RevokedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync();
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private static UserSummaryDto MapToDto(User user) => new(
        user.Id,
        user.Name,
        user.Email,
        user.RoleId,
        user.Role.Name,
        user.DepartmentId,
        user.Department?.Name,
        user.ManagerId,
        user.IsActive,
        user.AvatarUrl,
        user.ThemePreference,
        user.EmailNotificationsEnabled
    );

    public async Task<EmployeeStatisticsDto> GetEmployeeStatisticsAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId, HrSystem.Application.Assistant.Capabilities.Queries.EmployeeQuery? query = null)
    {
        // Enforce RBAC
        if (currentUserRole == RoleType.Employee.ToString())
        {
            throw new HrSystem.Application.Exceptions.AppUnauthorizedException("Employees cannot view employee statistics.");
        }

        var users = await _userRepository.GetUsersAsync(currentUserId, currentUserRole, currentUserDeptId, query);

        var deptDict = users
            .Where(u => u.IsActive && u.Department != null)
            .GroupBy(u => u.Department!.Name)
            .ToDictionary(g => g.Key, g => g.Count());

        int totalEmployees = users.Count(u => u.IsActive);

        return new EmployeeStatisticsDto(totalEmployees, deptDict);
    }
}
