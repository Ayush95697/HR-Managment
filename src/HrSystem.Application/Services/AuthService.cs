using System;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Security;
using HrSystem.Domain.Entities;
using HrSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HrSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly HrDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        HrDbContext dbContext,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        JwtSettings jwtSettings,
        ILogger<AuthService> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _jwtSettings = jwtSettings;
        _logger = logger;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return null;
        }

        string normalizedEmail = request.Email.Trim().ToLower();

        var user = await _dbContext.Users
            .Include(u => u.Role)
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
        {
            _logger.LogWarning("Login failed: User with email '{Email}' not found in database.", normalizedEmail);
            return null;
        }

        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed: User '{Email}' is inactive.", normalizedEmail);
            return null;
        }

        bool isPasswordValid = _passwordHasher.VerifyPassword(request.Password.Trim(), user.PasswordHash);
        if (!isPasswordValid)
        {
            _logger.LogWarning("Login failed: Password mismatch for user '{Email}'.", normalizedEmail);
            return null;
        }

        var (accessToken, expiresAt) = _jwtTokenGenerator.GenerateAccessToken(user);
        var rawRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        var hashedRefreshToken = _jwtTokenGenerator.HashRefreshToken(rawRefreshToken);

        // I-04 FIX: Clean up expired and revoked tokens for this user before creating a new one
        var staleTokens = await _dbContext.RefreshTokens
            .Where(rt => rt.UserId == user.Id && (rt.RevokedAt != null || rt.ExpiresAt <= DateTime.UtcNow))
            .ToListAsync();
        _dbContext.RefreshTokens.RemoveRange(staleTokens);

        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hashedRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        };

        _dbContext.RefreshTokens.Add(refreshTokenEntity);
        await _dbContext.SaveChangesAsync();

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

        return new LoginResponse(accessToken, rawRefreshToken, expiresAt, userSummary);
    }

    public async Task<LoginResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var hashedToken = _jwtTokenGenerator.HashRefreshToken(request.RefreshToken);

        var tokenEntity = await _dbContext.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.Role)
            .Include(rt => rt.User)
                .ThenInclude(u => u.Department)
            .FirstOrDefaultAsync(rt => rt.TokenHash == hashedToken);

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

        _dbContext.RefreshTokens.Add(newRefreshTokenEntity);
        await _dbContext.SaveChangesAsync();

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

        return new LoginResponse(accessToken, newRawRefreshToken, expiresAt, userSummary);
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var hashedToken = _jwtTokenGenerator.HashRefreshToken(refreshToken);
        var tokenEntity = await _dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == hashedToken);

        if (tokenEntity != null && tokenEntity.IsActive)
        {
            tokenEntity.RevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }
    }
}
