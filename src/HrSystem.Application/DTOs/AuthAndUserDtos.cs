using System;

namespace HrSystem.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record RefreshTokenRequest(string RefreshToken);

public record UserSummaryDto(
    Guid Id,
    string Name,
    string Email,
    int RoleId,
    string RoleName,
    Guid? DepartmentId,
    string? DepartmentName,
    Guid? ManagerId,
    bool IsActive
);

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserSummaryDto User
);

public record CreateUserRequest(
    string Name,
    string Email,
    string Password,
    int RoleId,
    Guid? DepartmentId,
    Guid? ManagerId
);

public record UpdateUserRequest(
    string Name,
    string Email,
    int RoleId,
    Guid? DepartmentId,
    Guid? ManagerId,
    bool IsActive
);
