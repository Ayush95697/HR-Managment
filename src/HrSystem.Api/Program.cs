using System;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using System.Threading.Tasks;
using FluentValidation;
using FluentValidation.AspNetCore;
using HrSystem.Api.Filters;
using HrSystem.Api.Middleware;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Interfaces.Repositories;
using HrSystem.Application.Security;
using HrSystem.Application.Services;
using HrSystem.Application.Validators.Auth;
using HrSystem.Infrastructure.Persistence;
using HrSystem.Infrastructure.Services;
using HrSystem.Infrastructure.Persistence.Repositories;
using HrSystem.Application.Assistant.Interfaces;
using HrSystem.Application.Assistant.Services;
using HrSystem.Application.Assistant.Builders;
using HrSystem.Application.Assistant.Nvidia;
using HrSystem.Application.Assistant.IntentRouting;
using HrSystem.Application.Assistant.Capabilities;
using HrSystem.Application.Assistant.Capabilities.Interfaces;
using HrSystem.Application.Assistant.Capabilities.Implementations;
using HrSystem.Application.Assistant.ParameterExtraction.Interfaces;
using HrSystem.Application.Assistant.ParameterExtraction.Implementations;
using HrSystem.Application.Assistant.ResponseStrategies.Interfaces;
using HrSystem.Application.Assistant.ResponseStrategies.Implementations;
using HrSystem.Infrastructure.Assistant.Retrieval;
using HrSystem.Api.Converters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Hangfire;
using HrSystem.Infrastructure.Jobs;
using HrSystem.Infrastructure.Email;

using System.IO;
using HrSystem.Api.Extensions;

string envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (!File.Exists(envPath))
{
    envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
}
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        string trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith("#")) continue;
        int index = trimmed.IndexOf('=');
        if (index > 0)
        {
            string key = trimmed.Substring(0, index).Trim();
            string value = trimmed.Substring(index + 1).Trim().Trim('"');
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

var builder = WebApplication.CreateBuilder(args);
builder.AddSerilogLogging();
builder.Configuration.AddEnvironmentVariables();

// Global ProblemDetails
builder.Services.AddProblemDetails();

// Health Checks
builder.Services.AddAppHealthChecks(builder.Configuration);

// 1. Jwt Settings
var jwtSettings = new JwtSettings();
builder.Configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);

// BUG-14 FIX: Fail fast if JWT secret is missing or too short (less than 32 chars / 256 bits)
if (string.IsNullOrWhiteSpace(jwtSettings.Secret) || jwtSettings.Secret.Length < 32)
    throw new InvalidOperationException(
        "JwtSettings:Secret is not configured or is too short. Set it in appsettings.json or user-secrets.");

builder.Services.AddSingleton(jwtSettings);

// Assistant Settings
builder.Services.Configure<HrSystem.Application.Assistant.Models.AssistantOptions>(
    builder.Configuration.GetSection(HrSystem.Application.Assistant.Models.AssistantOptions.SectionName));

// 2. DbContext
builder.Services.AddDbContext<HrDbContext>(options =>
{
    if (builder.Environment.IsEnvironment("Testing"))
    {
        options.UseInMemoryDatabase("HrTestingDb");
    }
    else
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        options.UseSqlServer(connectionString, b => b.MigrationsAssembly("HrSystem.Infrastructure"));
    }
});

// Hangfire
// Hangfire (Disabled during Integration Tests)
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddHangfire(config => config
        .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
        .UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UseSqlServerStorage(
            builder.Configuration.GetConnectionString("DefaultConnection")));

    builder.Services.AddHangfireServer();
}

// Gmail SMTP email provider
builder.Services.AddScoped<IEmailSender, GmailSmtpEmailSender>();
builder.Services.AddScoped<IEmailTemplateRenderer, EmailTemplateRenderer>();
builder.Services.AddScoped<EmailDispatchJob>();

// 3. Password Hasher & Token Generator
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

// 4. Azure Blob Storage
var azureStorageConnString = builder.Configuration.GetSection("AzureStorage:ConnectionString").Value;
if (!string.IsNullOrWhiteSpace(azureStorageConnString))
{
    builder.Services.AddSingleton(x => new BlobServiceClient(azureStorageConnString));
}
else
{
    // Fallback or log if missing
    builder.Services.AddSingleton(x => new BlobServiceClient("UseDevelopmentStorage=true"));
}

// 5. Application Services
builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IBoardRepository, BoardRepository>();
builder.Services.AddScoped<ITaskCardRepository, TaskCardRepository>();
builder.Services.AddScoped<IEmailRepository, EmailRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<ISearchRepository, SearchRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<ITaskCardService, TaskCardService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmailDispatchService, EmailDispatchService>();
builder.Services.AddScoped<IEmailDispatchQueue, HangfireEmailDispatchQueue>();
builder.Services.AddScoped<HrSystem.Infrastructure.Interfaces.ITestDataSeeder, TestDataSeeder>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<HrSystem.Api.Services.IAvatarService, HrSystem.Api.Services.AvatarService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// AI Assistant Module
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IPromptBuilder, PromptBuilder>();
builder.Services.AddHttpClient("NvidiaNimClient");
builder.Services.AddScoped<ILLMClient, NvidiaNimClient>();
builder.Services.AddScoped<IRetriever, SyntheticRetriever>();

builder.Services.AddScoped<IContextBuilder, EmployeeContextBuilder>();
builder.Services.AddScoped<IContextBuilder, HrContextBuilder>();
builder.Services.AddScoped<IContextBuilder, AdminContextBuilder>();

// Capability System
builder.Services.AddScoped<IIntentRouter, IntentRouter>();
builder.Services.AddScoped<ICapabilityResolver, CapabilityResolver>();
builder.Services.AddScoped<IAssistantCapability, TaskCapability>();
builder.Services.AddScoped<IAssistantCapability, DepartmentCapability>();
builder.Services.AddScoped<IAssistantCapability, EmployeeCapability>();
builder.Services.AddScoped<IAssistantCapability, BoardCapability>();

// Parameter Extractors
builder.Services.AddScoped<IParameterExtractor, MainParameterExtractor>();
builder.Services.AddScoped<IDepartmentExtractor, DepartmentExtractor>();
builder.Services.AddScoped<ITaskExtractor, TaskExtractor>();
builder.Services.AddScoped<IEmployeeExtractor, EmployeeExtractor>();
builder.Services.AddScoped<IBoardExtractor, BoardExtractor>();

// Response Strategies
builder.Services.AddScoped<IResponseStrategyResolver, ResponseStrategyResolver>();
builder.Services.AddScoped<IResponseStrategy, TemplateResponseStrategy>();
builder.Services.AddScoped<IResponseStrategy, LlmResponseStrategy>();

// 5. Authorization
builder.Services.AddScoped<IAuthorizationHandler, HrSameDepartmentHandler>();
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("HrSameDepartment", policy =>
        policy.Requirements.Add(new HrSameDepartmentRequirement()));

    // Permission Policies
    foreach (var field in typeof(Permissions).GetFields())
    {
        var permission = field.GetValue(null)?.ToString();
        if (!string.IsNullOrEmpty(permission))
        {
            options.AddPolicy(permission, policy => policy.Requirements.Add(new PermissionRequirement(permission)));
        }
    }
});

// 6. Jwt Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ClockSkew = TimeSpan.Zero
    };
});

// 7. Controllers & Validation
builder.Services.AddControllers(options =>
{
    options.Filters.Add<GlobalExceptionFilter>();
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
    options.JsonSerializerOptions.Converters.Add(new NullableUtcDateTimeConverter());
});
builder.Services.AddResponseCaching();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

// 8. CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// 9. Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HR Management API",
        Version = "v1",
        Description = "ASP.NET Core 8 Web API for HR Management System with RBAC and Optimistic Concurrency."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your valid JWT Access Token below.\nExample: Bearer eyJhbGciOi..."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseSerilogRequestLoggingWithContext();
app.UseCorrelationId();

// Global Exception Handler
app.UseMiddleware<GlobalExceptionMiddleware>();

// BUG-13 FIX: Swagger only in Development — do NOT expose in production
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HR Management API v1");
    });
}

app.UseHttpsRedirection();

app.UseCors("CorsPolicy");

app.UseDefaultFiles();
app.UseStaticFiles(); // Serves wwwroot/avatars/ and other static files

app.UseResponseCaching();

app.UseAuthentication();
app.UseAuthorization();
app.UseUserEnrichment();

if (!app.Environment.IsEnvironment("Testing"))
{
    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {
        Authorization = new[]
        {
            new HangfireAdminAuthorizationFilter()
        }
    });
}

app.MapControllers();
app.MapAppHealthChecks();
app.MapFallbackToFile("index.html");

// Seed Database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<HrDbContext>();
        await db.Database.MigrateAsync();
        await DbInitializer.SeedAsync(db);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not seed database on startup.");
    }
}

app.Run();

public partial class Program { }