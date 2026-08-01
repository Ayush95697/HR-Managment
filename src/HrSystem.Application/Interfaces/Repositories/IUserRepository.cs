using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using HrSystem.Domain.Entities;

namespace HrSystem.Application.Interfaces.Repositories;

public interface IUserRepository
{
    // AuthService needs
    Task<User?> GetUserByEmailWithDetailsAsync(string email);
    Task RemoveStaleRefreshTokensAsync(Guid userId);
    Task AddRefreshTokenAsync(RefreshToken token);
    Task<RefreshToken?> GetRefreshTokenWithDetailsAsync(string tokenHash);
    Task<RefreshToken?> GetRefreshTokenAsync(string tokenHash);

    // UserService needs
    Task<List<User>> GetUsersAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId, HrSystem.Application.Assistant.Capabilities.Queries.EmployeeQuery? query = null);
    Task<User?> GetUserByIdWithDetailsAsync(Guid id);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<Guid?> FindIdByNameAsync(string name);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> ExistsByEmailExceptIdAsync(string email, Guid excludeId);
    Task<bool> HrExistsInDepartmentAsync(Guid departmentId);
    Task<bool> HrExistsInDepartmentExceptIdAsync(Guid departmentId, Guid excludeId);
    Task<User?> GetHrInDepartmentAsync(Guid departmentId);
    Task<User?> GetHrInDepartmentExceptIdAsync(Guid departmentId, Guid excludeId);
    Task<Role?> GetRoleByIdAsync(int id);
    Task AddAsync(User user);
    Task<List<RefreshToken>> GetActiveRefreshTokensAsync(Guid userId);
    Task<RefreshToken?> GetRefreshTokenByIdAndUserAsync(Guid sessionId, Guid userId);
    Task<List<RefreshToken>> GetActiveRefreshTokensExceptAsync(Guid userId, Guid? excludeTokenId);

    // Common
    Task SaveChangesAsync();
}