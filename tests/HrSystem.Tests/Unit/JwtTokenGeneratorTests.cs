using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using HrSystem.Application.Security;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using Xunit;

namespace HrSystem.Tests.Unit;

public class JwtTokenGeneratorTests
{
    private readonly JwtSettings _jwtSettings = new()
    {
        Secret = "SuperSecretKeyForTestingHrManagementSystem2026!",
        Issuer = "HrSystemApi",
        Audience = "HrSystemApp",
        AccessTokenExpirationMinutes = 15,
        RefreshTokenExpirationDays = 7
    };

    [Fact]
    public void GenerateAccessToken_ShouldIncludeCorrectClaims()
    {
        var generator = new JwtTokenGenerator(_jwtSettings);
        var deptId = Guid.NewGuid();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Jane HR Manager",
            Email = "hr@hrsystem.com",
            RoleId = (int)RoleType.HR,
            Role = new Role { Id = (int)RoleType.HR, Name = "HR" },
            DepartmentId = deptId,
            Department = new Department { Id = deptId, Name = "Human Resources" }
        };

        var (tokenString, expiresAt) = generator.GenerateAccessToken(user);

        Assert.NotNull(tokenString);
        Assert.True(expiresAt > DateTime.UtcNow);

        var handler = new JwtSecurityTokenHandler();
        var token = handler.ReadJwtToken(tokenString);

        Assert.Equal(_jwtSettings.Issuer, token.Issuer);
        Assert.Equal(_jwtSettings.Audience, token.Audiences.First());

        var nameIdClaim = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid" || c.Type == "sub")?.Value;
        var roleClaim = token.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role")?.Value;
        var deptClaim = token.Claims.FirstOrDefault(c => c.Type == "departmentId")?.Value;

        Assert.Equal(user.Id.ToString(), nameIdClaim);
        Assert.Equal("HR", roleClaim);
        Assert.Equal(deptId.ToString(), deptClaim);
    }

    [Fact]
    public void GenerateRefreshToken_ShouldBeUniqueAndHashable()
    {
        var generator = new JwtTokenGenerator(_jwtSettings);
        string token1 = generator.GenerateRefreshToken();
        string token2 = generator.GenerateRefreshToken();

        Assert.NotEqual(token1, token2);

        string hash1 = generator.HashRefreshToken(token1);
        string hash2 = generator.HashRefreshToken(token1);

        Assert.Equal(hash1, hash2);
    }
}
