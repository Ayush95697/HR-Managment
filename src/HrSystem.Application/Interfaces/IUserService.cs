using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;

namespace HrSystem.Application.Interfaces;

public interface IUserService
{
    Task<List<UserSummaryDto>> GetUsersAsync(Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<UserSummaryDto> GetUserByIdAsync(Guid id, Guid currentUserId, string currentUserRole, Guid? currentUserDeptId);
    Task<UserSummaryDto> GetCurrentUserAsync(Guid currentUserId);
    Task<UserSummaryDto> CreateUserAsync(CreateUserRequest request);
    Task<UserSummaryDto> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task SoftDeleteUserAsync(Guid id);

    // Self-service /me endpoints
    Task<UserSummaryDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task UpdateAvatarUrlAsync(Guid userId, string? avatarUrl);
    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
    Task<List<SessionDto>> GetSessionsAsync(Guid userId, Guid? currentTokenId);
    Task RevokeSessionAsync(Guid sessionId, Guid ownerUserId);
    Task RevokeAllOtherSessionsAsync(Guid userId, Guid? currentTokenId);
}
