using System;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Application.Security;
using HrSystem.Domain.Entities;

using Microsoft.Extensions.Logging;

namespace HrSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        JwtSettings jwtSettings,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _jwtSettings = jwtSettings;
        _logger = logger;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        var user = await _userRepository.GetUserByEmailWithDetailsAsync(request.Email);

        if (user == null)
        {
            _logger.LogWarning("Login failed: User with email '{Email}' not found in database.", request.Email);
            return null;
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed: User '{Email}' is inactive.", request.Email);
            return null;
        }

        bool isPasswordValid = _passwordHasher.VerifyPassword(request.Password.Trim(), user.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Login failed: Password mismatch for user '{Email}'.", request.Email);
            return null;
        }

        var (accessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user);
        var rawRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var hashedRefreshToken = _jwtTokenGenerator.HashRefreshToken(rawRefreshToken);

        await _userRepository.RemoveStaleRefreshTokensAsync(user.Id);

        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hashedRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        };

        await _userRepository.AddRefreshTokenAsync(refreshTokenEntity);
        await _userRepository.SaveChangesAsync();

        var userSummary = new UserSummaryDto(
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

        _logger.LogInformation("User {UserId} logged in successfully.", user.Id);

        return new LoginResponse(accessToken, rawRefreshToken, expiresAt, userSummary);
    }

    public async Task<LoginResponse?> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var hashedToken = _jwtTokenGenerator.HashRefreshToken(request.RefreshToken);

        var tokenEntity = await _userRepository.GetRefreshTokenWithDetailsAsync(hashedToken);

        if (tokenEntity == null || !tokenEntity.IsActive || !tokenEntity.User.IsActive)
        {
            return null;
        }

        tokenEntity.RevokedAt = DateTime.UtcNow;

        var (accessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(tokenEntity.User);
        var newRawRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var newHashedRefreshToken = _jwtTokenGenerator.HashRefreshToken(newRawRefreshToken);

        tokenEntity.ReplacedByTokenHash = newHashedRefreshToken;

        var newRefreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = tokenEntity.User.Id,
            TokenHash = newHashedRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        };

        await _userRepository.AddRefreshTokenAsync(newRefreshTokenEntity);
        await _userRepository.SaveChangesAsync();

        var userSummary = new UserSummaryDto(
            tokenEntity.User.Id,
            tokenEntity.User.Name,
            tokenEntity.User.Email,
            tokenEntity.User.RoleId,
            tokenEntity.User.Role.Name,
            tokenEntity.User.DepartmentId,
            tokenEntity.User.Department?.Name,
            tokenEntity.User.ManagerId,
            tokenEntity.User.IsActive
        );

        _logger.LogInformation("Token refreshed successfully for User {UserId}.", tokenEntity.User.Id);

        return new LoginResponse(accessToken, newRawRefreshToken, expiresAt, userSummary);
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var hashedToken = _jwtTokenGenerator.HashRefreshToken(refreshToken);
        var tokenEntity = await _userRepository.GetRefreshTokenAsync(hashedToken);

        if (tokenEntity != null && tokenEntity.IsActive)
        {
            tokenEntity.RevokedAt = DateTime.UtcNow;
            await _userRepository.SaveChangesAsync();
            _logger.LogInformation("Token revoked successfully for User {UserId}.", tokenEntity.UserId);
        }
    }
}