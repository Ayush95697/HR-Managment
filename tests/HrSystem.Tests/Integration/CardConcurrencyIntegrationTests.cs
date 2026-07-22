using System;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using HrSystem.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace HrSystem.Tests.Integration;

public class CardConcurrencyIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public CardConcurrencyIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PatchCard_WithStaleRowVersion_ShouldReturn409Conflict()
    {
        var client = _factory.CreateClient();

        // Login as HR
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest("hr@hrsystem.com", "Admin123!"));
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult!.AccessToken);

        // Fetch sample card seeded in DbInitializer
        Guid cardId = Guid.Parse("d1111111-1111-1111-1111-111111111111");
        var cardResponse = await client.GetAsync($"/api/cards/{cardId}");
        Assert.Equal(HttpStatusCode.OK, cardResponse.StatusCode);
        var cardDetail = await cardResponse.Content.ReadFromJsonAsync<TaskCardDetailDto>();
        Assert.NotNull(cardDetail);

        // 1. Valid PATCH using actual RowVersion
        var validPatchRequest = new PatchTaskCardRequest(
            ColumnId: null,
            Title: "Updated Title - Concurrent Test",
            Description: null,
            Priority: null,
            DueDate: null,
            AssignedToId: null,
            ClearAssignee: null,
            Position: null,
            RowVersion: cardDetail.RowVersion
        );

        var patchResponse = await client.PatchAsJsonAsync($"/api/cards/{cardId}", validPatchRequest);
        Assert.Equal(HttpStatusCode.OK, patchResponse.StatusCode);

        // 2. Stale PATCH using old/mismatched RowVersion
        byte[] staleRowVersion = new byte[] { 0, 0, 0, 0, 0, 0, 0, 99 };
        var stalePatchRequest = new PatchTaskCardRequest(
            ColumnId: null,
            Title: "Stale Patch Attempt",
            Description: null,
            Priority: null,
            DueDate: null,
            AssignedToId: null,
            ClearAssignee: null,
            Position: null,
            RowVersion: staleRowVersion
        );

        var conflictResponse = await client.PatchAsJsonAsync($"/api/cards/{cardId}", stalePatchRequest);
        Assert.Equal(HttpStatusCode.Conflict, conflictResponse.StatusCode);

        var problemDetails = await conflictResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        Assert.NotNull(problemDetails);
        Assert.Equal(409, problemDetails.Status);
        Assert.Contains("Stale write", problemDetails.Detail);
    }
}
