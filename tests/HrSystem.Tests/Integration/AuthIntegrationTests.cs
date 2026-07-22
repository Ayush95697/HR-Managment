using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using Xunit;

namespace HrSystem.Tests.Integration;

public class AuthIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_ProtectedEndpoint_Refresh_Logout_Flow_ShouldSucceed()
    {
        var client = _factory.CreateClient();

        // 1. Login
        var loginRequest = new LoginRequest("admin@hrsystem.com", "Admin123!");
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", loginRequest);

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(loginResult);
        Assert.NotEmpty(loginResult.AccessToken);
        Assert.NotEmpty(loginResult.RefreshToken);

        // 2. Access protected endpoint /api/users/me
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult.AccessToken);
        var meResponse = await client.GetAsync("/api/users/me");

        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        var meResult = await meResponse.Content.ReadFromJsonAsync<UserSummaryDto>();
        Assert.NotNull(meResult);
        Assert.Equal("admin@hrsystem.com", meResult.Email);

        // 3. Refresh token
        var refreshRequest = new RefreshTokenRequest(loginResult.RefreshToken);
        var refreshResponse = await client.PostAsJsonAsync("/api/auth/refresh", refreshRequest);

        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);
        var refreshResult = await refreshResponse.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.NotNull(refreshResult);
        Assert.NotEmpty(refreshResult.AccessToken);
        Assert.NotEqual(loginResult.AccessToken, refreshResult.AccessToken);

        // 4. Logout
        var logoutRequest = new RefreshTokenRequest(refreshResult.RefreshToken);
        var logoutResponse = await client.PostAsJsonAsync("/api/auth/logout", logoutRequest);

        Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);
    }
}
