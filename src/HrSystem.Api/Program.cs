using System;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using FluentValidation;
using FluentValidation.AspNetCore;
using HrSystem.Api.Filters;
using HrSystem.Api.Middleware;
using HrSystem.Application.Interfaces;
using HrSystem.Application.Security;
using HrSystem.Application.Services;
using HrSystem.Application.Validators;
using HrSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using System.IO;

var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (!File.Exists(envPath))
{
    envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
}
if (File.Exists(envPath))
{
    foreach (var line in File.ReadAllLines(envPath))
    {
        var span = line.AsSpan().Trim();
        if (span.IsEmpty || span.StartsWith("#")) continue;
        var index = span.IndexOf('=');
        if (index > 0)
        {
            var key = span.Slice(0, index).Trim().ToString();
            var value = span.Slice(index + 1).Trim().Trim('"').ToString();
            Environment.SetEnvironmentVariable(key, value);
        }
    }
}

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// 1. Jwt Settings
var jwtSettings = new JwtSettings();
builder.Configuration.GetSection(JwtSettings.SectionName).Bind(jwtSettings);

// BUG-14 FIX: Fail fast if JWT secret is missing or too short (less than 32 chars / 256 bits)
if (string.IsNullOrWhiteSpace(jwtSettings.Secret) || jwtSettings.Secret.Length < 32)
    throw new InvalidOperationException(
        "JwtSettings:Secret is not configured or is too short. Set it in appsettings.json or user-secrets.");

builder.Services.AddSingleton(jwtSettings);

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
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<ITaskCardService, TaskCardService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<HrSystem.Api.Services.IAvatarService, HrSystem.Api.Services.AvatarService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// 5. Authorization
builder.Services.AddScoped<IAuthorizationHandler, HrSameDepartmentHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("HrSameDepartment", policy =>
        policy.Requirements.Add(new HrSameDepartmentRequirement()));
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
});
builder.Services.AddResponseCaching();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<LoginRequestValidator>();

// 8. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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

app.UseCors("CorsPolicy");

app.UseStaticFiles(); // Serves wwwroot/avatars/ and other static files

app.UseResponseCaching();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<HrDbContext>();
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
