using HrSystem.Application.Security;

using Xunit;

namespace HrSystem.Tests.Unit;

public class PasswordHasherTests
{
    private readonly BCryptPasswordHasher _hasher = new();

    [Fact]
    public void HashPassword_ShouldReturnValidHash()
    {
        string password = "TestPassword123!";
        string hash = _hasher.HashPassword(password);

        Assert.NotNull(hash);
        Assert.NotEmpty(hash);
        Assert.NotEqual(password, hash);
    }

    [Fact]
    public void VerifyPassword_WithCorrectPassword_ShouldReturnTrue()
    {
        string password = "TestPassword123!";
        string hash = _hasher.HashPassword(password);

        bool result = _hasher.VerifyPassword(password, hash);

        Assert.True(result);
    }

    [Fact]
    public void VerifyPassword_WithIncorrectPassword_ShouldReturnFalse()
    {
        string password = "TestPassword123!";
        string wrongPassword = "WrongPassword123!";
        string hash = _hasher.HashPassword(password);

        bool result = _hasher.VerifyPassword(wrongPassword, hash);

        Assert.False(result);
    }
}