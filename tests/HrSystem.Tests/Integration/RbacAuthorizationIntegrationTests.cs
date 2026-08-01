using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;

using HrSystem.Application.DTOs;

using Xunit;

namespace HrSystem.Tests.Integration;

public class RbacAuthorizationIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public RbacAuthorizationIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task HrSendingEmailOutsideDepartment_ShouldReturn403Forbidden()
    {
        var client = _factory.CreateClient();

        // Login as HR user (department = Human Resources)
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest("hr@hrsystem.com", "Admin123!"));
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult!.AccessToken);

        // Attempt to send email to employee in Engineering department
        Guid employeeInEngId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
        Guid templateId = Guid.Parse("e1111111-1111-1111-1111-111111111111");

        var sendEmailRequest = new SendEmailRequest(
            ToUserId: employeeInEngId,
            TemplateId: templateId,
            IdempotencyKey: "test-idempotency-key-001",
            Placeholders: new Dictionary<string, string>()
        );

        var response = await client.PostAsJsonAsync("/api/email/send", sendEmailRequest);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task EmployeeAttemptingToPatchCard_ShouldReturn403Forbidden()
    {
        var client = _factory.CreateClient();

        // Login as Employee user
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest("employee@hrsystem.com", "Admin123!"));
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", loginResult!.AccessToken);

        Guid cardId = Guid.Parse("d1111111-1111-1111-1111-111111111111");
        var patchRequest = new PatchTaskCardRequest(
            ColumnId: null,
            Title: "Employee Unauthorized Patch",
            Description: null,
            Priority: null,
            DueDate: null,
            AssignedToId: null,
            ClearAssignee: null,
            Position: null,
            RowVersion: new byte[] { 1, 2, 3 }
        );

        var response = await client.PatchAsJsonAsync($"/api/cards/{cardId}", patchRequest);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}