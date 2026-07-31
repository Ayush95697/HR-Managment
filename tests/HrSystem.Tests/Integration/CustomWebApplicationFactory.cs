using System;
using System.IO;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HrSystem.Tests.Integration;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public CustomWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable("JwtSettings__Secret", "SuperSecretKeyForHrManagementSystemTesting2026!MustBeAtLeast32Chars");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((context, config) =>
        {
            config.AddInMemoryCollection(new System.Collections.Generic.Dictionary<string, string?>
            {
                { "JwtSettings:Secret", "SuperSecretKeyForHrManagementSystemTesting2026!MustBeAtLeast32Chars" }
            });
        });

        builder.ConfigureTestServices(services =>
        {
            var descriptors = services.Where(d => d.ServiceType == typeof(DbContextOptions<HrDbContext>) || d.ServiceType == typeof(HrDbContext)).ToList();
            foreach (var d in descriptors)
            {
                services.Remove(d);
            }

            string dbName = $"HrTestDb_{Guid.NewGuid()}";
            services.AddDbContext<HrDbContext>(options =>
            {
                options.UseInMemoryDatabase(dbName);
            });

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<HrDbContext>();
            db.Database.EnsureDeleted();
            DbInitializer.SeedAsync(db).GetAwaiter().GetResult();

            // Add StartupFilter to fix .NET 9 TestHost PipeWriter issue
            services.AddTransient<IStartupFilter, TestHostFixStartupFilter>();

            // Add dummy Hangfire IBackgroundJobClient since Hangfire is disabled in Testing
            services.AddSingleton<Hangfire.IBackgroundJobClient, DummyBackgroundJobClient>();
        });
    }

    private class DummyBackgroundJobClient : Hangfire.IBackgroundJobClient
    {
        public bool ChangeState(string jobId, Hangfire.States.IState state, string expectedState) => true;
        public string Create(Hangfire.Common.Job job, Hangfire.States.IState state) => Guid.NewGuid().ToString();
    }

    private class TestHostFixStartupFilter : IStartupFilter
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
        {
            return app =>
            {
                app.Use(async (context, nextMiddleware) =>
                {
                    var originalBody = context.Response.Body;
                    using var memStream = new MemoryStream();
                    context.Response.Body = memStream;

                    await nextMiddleware();

                    memStream.Position = 0;
                    await memStream.CopyToAsync(originalBody);
                    context.Response.Body = originalBody;
                });

                next(app);
            };
        }
    }
}
