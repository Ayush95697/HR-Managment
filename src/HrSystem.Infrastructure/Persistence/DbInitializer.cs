using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HrSystem.Domain.Entities;
using HrSystem.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HrSystem.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(HrDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // 1. Seed Roles
        if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.Admin))
        {
            bool isSqlServer = context.Database.IsSqlServer();
            if (isSqlServer)
            {
                try
                {
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT [Roles] ON;");
                }
                catch { }
            }

            if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.Admin))
                context.Roles.Add(new Role { Id = (int)RoleType.Admin, Name = "Admin" });
            if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.HR))
                context.Roles.Add(new Role { Id = (int)RoleType.HR, Name = "HR" });
            if (!await context.Roles.AnyAsync(r => r.Id == (int)RoleType.Employee))
                context.Roles.Add(new Role { Id = (int)RoleType.Employee, Name = "Employee" });

            await context.SaveChangesAsync();

            if (isSqlServer)
            {
                try
                {
                    await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT [Roles] OFF;");
                }
                catch { }
            }
        }

        // 2. Seed Departments
        Guid hrDeptId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        Guid engDeptId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        Guid mktDeptId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        Guid salesDeptId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        Guid finDeptId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        Guid prodDeptId = Guid.Parse("66666666-6666-6666-6666-666666666666");

        var depts = new List<Department>
        {
            new Department { Id = hrDeptId, Name = "Human Resources" },
            new Department { Id = engDeptId, Name = "Engineering" },
            new Department { Id = mktDeptId, Name = "Marketing" },
            new Department { Id = salesDeptId, Name = "Sales & Growth" },
            new Department { Id = finDeptId, Name = "Finance & Operations" },
            new Department { Id = prodDeptId, Name = "Product & Design" }
        };

        foreach (var d in depts)
        {
            if (!await context.Departments.AnyAsync(existing => existing.Id == d.Id || existing.Name == d.Name))
            {
                context.Departments.Add(d);
            }
        }
        await context.SaveChangesAsync();

        // 3. Seed Core Users (Admin, HR, Employee)
        string defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!");
        Guid adminUserId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        Guid hrUserId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        Guid employeeUserId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");

        var admin = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == "admin@hrsystem.com");
        if (admin == null)
        {
            admin = new User
            {
                Id = adminUserId,
                Name = "System Admin",
                Email = "admin@hrsystem.com",
                PasswordHash = defaultPasswordHash,
                RoleId = (int)RoleType.Admin,
                DepartmentId = null,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-60),
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(admin);
        }

        var hr = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == "hr@hrsystem.com");
        if (hr == null)
        {
            hr = new User
            {
                Id = hrUserId,
                Name = "Jane HR Manager",
                Email = "hr@hrsystem.com",
                PasswordHash = defaultPasswordHash,
                RoleId = (int)RoleType.HR,
                DepartmentId = hrDeptId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-55),
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(hr);
        }

        var employee = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == "employee@hrsystem.com");
        if (employee == null)
        {
            employee = new User
            {
                Id = employeeUserId,
                Name = "John Developer",
                Email = "employee@hrsystem.com",
                PasswordHash = defaultPasswordHash,
                RoleId = (int)RoleType.Employee,
                DepartmentId = engDeptId,
                ManagerId = hrUserId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-50),
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(employee);
        }

        await context.SaveChangesAsync();

        // 4. Seed Additional Mock Users across Departments
        var mockUsersData = new[]
        {
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777701"), Name = "Alex Rivera", Email = "alex.rivera@hrsystem.com", DeptId = engDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 25 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777702"), Name = "David Kim", Email = "david.kim@hrsystem.com", DeptId = engDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 20 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777703"), Name = "Marcus Vance", Email = "marcus.vance@hrsystem.com", DeptId = engDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 18 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777704"), Name = "Sarah Connor", Email = "sarah.connor@hrsystem.com", DeptId = mktDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 15 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777705"), Name = "Lisa Wong", Email = "lisa.wong@hrsystem.com", DeptId = mktDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 12 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777706"), Name = "Michael Scott", Email = "michael.scott@hrsystem.com", DeptId = salesDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 10 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777707"), Name = "Dwight Schrute", Email = "dwight.schrute@hrsystem.com", DeptId = salesDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 8 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777708"), Name = "Jim Halpert", Email = "jim.halpert@hrsystem.com", DeptId = salesDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 6 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777709"), Name = "Angela Martin", Email = "angela.martin@hrsystem.com", DeptId = finDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 5 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777710"), Name = "Oscar Martinez", Email = "oscar.martinez@hrsystem.com", DeptId = finDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 3 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777711"), Name = "Elena Rostova", Email = "elena.rostova@hrsystem.com", DeptId = prodDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 2 },
            new { Id = Guid.Parse("77777777-7777-7777-7777-777777777712"), Name = "Rachel Green", Email = "rachel.green@hrsystem.com", DeptId = hrDeptId, RoleId = (int)RoleType.Employee, DaysAgo = 1 }
        };

        foreach (var u in mockUsersData)
        {
            if (!await context.Users.AnyAsync(existing => existing.Id == u.Id || existing.Email == u.Email))
            {
                context.Users.Add(new User
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    PasswordHash = defaultPasswordHash,
                    RoleId = u.RoleId,
                    DepartmentId = u.DeptId,
                    ManagerId = hrUserId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-u.DaysAgo),
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }
        await context.SaveChangesAsync();

        // 5. Seed Boards, Columns & Task Cards for Analytics
        Guid board1Id = Guid.Parse("b1111111-1111-1111-1111-111111111111");
        Guid board2Id = Guid.Parse("b2222222-2222-2222-2222-222222222222");

        Guid c1TodoId = Guid.Parse("c1111111-1111-1111-1111-111111111111");
        Guid c1ProgressId = Guid.Parse("c1111111-1111-1111-1111-222222222222");
        Guid c1DoneId = Guid.Parse("c1111111-1111-1111-1111-333333333333");

        Guid c2TodoId = Guid.Parse("c2222222-2222-2222-2222-111111111111");
        Guid c2ProgressId = Guid.Parse("c2222222-2222-2222-2222-222222222222");
        Guid c2DoneId = Guid.Parse("c2222222-2222-2222-2222-333333333333");

        if (!await context.Boards.AnyAsync(b => b.Id == board1Id))
        {
            var board1 = new Board
            {
                Id = board1Id,
                Name = "HR Onboarding & Compliance",
                OwnerId = hrUserId,
                DepartmentId = hrDeptId,
                CreatedAt = DateTime.UtcNow.AddDays(-40)
            };

            board1.Columns.Add(new BoardColumn { Id = c1TodoId, BoardId = board1Id, Name = "To Do", Order = 0 });
            board1.Columns.Add(new BoardColumn { Id = c1ProgressId, BoardId = board1Id, Name = "In Progress", Order = 1 });
            board1.Columns.Add(new BoardColumn { Id = c1DoneId, BoardId = board1Id, Name = "Done", Order = 2, IsDoneColumn = true });
            context.Boards.Add(board1);
        }

        if (!await context.Boards.AnyAsync(b => b.Id == board2Id))
        {
            var board2 = new Board
            {
                Id = board2Id,
                Name = "Core Engineering Sprint Q3",
                OwnerId = adminUserId,
                DepartmentId = engDeptId,
                CreatedAt = DateTime.UtcNow.AddDays(-35)
            };

            board2.Columns.Add(new BoardColumn { Id = c2TodoId, BoardId = board2Id, Name = "Backlog", Order = 0 });
            board2.Columns.Add(new BoardColumn { Id = c2ProgressId, BoardId = board2Id, Name = "In Review", Order = 1 });
            board2.Columns.Add(new BoardColumn { Id = c2DoneId, BoardId = board2Id, Name = "Completed", Order = 2, IsDoneColumn = true });
            context.Boards.Add(board2);
        }

        await context.SaveChangesAsync();

        // 6. Ensure Task Cards Exist for Velocity & Workload Balance
        if (!await context.TaskCards.AnyAsync(t => t.BoardId == board1Id || t.BoardId == board2Id))
        {
            var alexId = Guid.Parse("77777777-7777-7777-7777-777777777701");
            var davidId = Guid.Parse("77777777-7777-7777-7777-777777777702");
            var sarahId = Guid.Parse("77777777-7777-7777-7777-777777777704");

            var tasks = new List<TaskCard>
            {
                // High/Critical Open Tasks for Workload Balance Chart
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2Id, ColumnId = c2ProgressId, AssignedToId = employeeUserId, Title = "Optimize Database Indexing", Priority = TaskPriority.Critical, CreatedById = adminUserId, Position = 1000, CreatedAt = DateTime.UtcNow.AddDays(-5), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2Id, ColumnId = c2TodoId, AssignedToId = employeeUserId, Title = "Fix Memory Leak in Auth Cache", Priority = TaskPriority.High, CreatedById = adminUserId, Position = 2000, CreatedAt = DateTime.UtcNow.AddDays(-4), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2Id, ColumnId = c2ProgressId, AssignedToId = alexId, Title = "Refactor Microservice Bus", Priority = TaskPriority.Critical, CreatedById = adminUserId, Position = 1000, CreatedAt = DateTime.UtcNow.AddDays(-6), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2Id, ColumnId = c2TodoId, AssignedToId = alexId, Title = "Kubernetes Cluster Auto-scaler Setup", Priority = TaskPriority.High, CreatedById = adminUserId, Position = 2000, CreatedAt = DateTime.UtcNow.AddDays(-3), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2Id, ColumnId = c2ProgressId, AssignedToId = davidId, Title = "Implement Real-time WebSockets", Priority = TaskPriority.Critical, CreatedById = adminUserId, Position = 1000, CreatedAt = DateTime.UtcNow.AddDays(-7), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board2Id, ColumnId = c2TodoId, AssignedToId = davidId, Title = "API Gateway Rate Limiting", Priority = TaskPriority.High, CreatedById = adminUserId, Position = 2000, CreatedAt = DateTime.UtcNow.AddDays(-2), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board1Id, ColumnId = c1ProgressId, AssignedToId = sarahId, Title = "Q3 Marketing Campaign Launch", Priority = TaskPriority.Critical, CreatedById = hrUserId, Position = 1000, CreatedAt = DateTime.UtcNow.AddDays(-4), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board1Id, ColumnId = c1TodoId, AssignedToId = sarahId, Title = "Brand Identity Guideline Refresh", Priority = TaskPriority.High, CreatedById = hrUserId, Position = 2000, CreatedAt = DateTime.UtcNow.AddDays(-1), UpdatedAt = DateTime.UtcNow },
                new TaskCard { Id = Guid.NewGuid(), BoardId = board1Id, ColumnId = c1ProgressId, AssignedToId = hrUserId, Title = "Annual HR Compliance Audit", Priority = TaskPriority.High, CreatedById = adminUserId, Position = 1000, CreatedAt = DateTime.UtcNow.AddDays(-8), UpdatedAt = DateTime.UtcNow }
            };

            // Historical Completed Tasks for Task Velocity Chart (spanning last 30 days)
            int[] completionsPerDayAgo = new[] { 5, 8, 3, 12, 4, 15, 7, 9, 14, 6, 11, 8, 10, 5, 13, 9, 4, 16, 7, 12 };
            int dayOffset = 1;
            foreach (var count in completionsPerDayAgo)
            {
                for (int k = 0; k < count; k++)
                {
                    tasks.Add(new TaskCard
                    {
                        Id = Guid.NewGuid(),
                        BoardId = board2Id,
                        ColumnId = c2DoneId,
                        AssignedToId = (k % 2 == 0) ? alexId : davidId,
                        Title = $"Completed Sprint Task #{dayOffset * 10 + k}",
                        Priority = TaskPriority.Medium,
                        CreatedById = adminUserId,
                        Position = 1000 + k,
                        CreatedAt = DateTime.UtcNow.AddDays(-dayOffset - 2),
                        UpdatedAt = DateTime.UtcNow.AddDays(-dayOffset),
                        CompletedAt = DateTime.UtcNow.AddDays(-dayOffset)
                    });
                }
                dayOffset += 1;
            }

            context.TaskCards.AddRange(tasks);
            await context.SaveChangesAsync();

            // Seed Activity Logs
            var sampleLogs = new List<TaskActivityLog>
            {
                new TaskActivityLog { Id = Guid.NewGuid(), TaskCardId = tasks[0].Id, ActorId = adminUserId, Action = TaskActivityAction.Moved, ToColumnId = c2ProgressId, Timestamp = DateTime.UtcNow.AddHours(-2) },
                new TaskActivityLog { Id = Guid.NewGuid(), TaskCardId = tasks[1].Id, ActorId = alexId, Action = TaskActivityAction.Commented, Timestamp = DateTime.UtcNow.AddHours(-5) },
                new TaskActivityLog { Id = Guid.NewGuid(), TaskCardId = tasks[2].Id, ActorId = hrUserId, Action = TaskActivityAction.Assigned, Timestamp = DateTime.UtcNow.AddHours(-12) },
                new TaskActivityLog { Id = Guid.NewGuid(), TaskCardId = tasks[3].Id, ActorId = employeeUserId, Action = TaskActivityAction.Created, Timestamp = DateTime.UtcNow.AddDays(-1) },
                new TaskActivityLog { Id = Guid.NewGuid(), TaskCardId = tasks[4].Id, ActorId = davidId, Action = TaskActivityAction.Edited, Timestamp = DateTime.UtcNow.AddDays(-2) }
            };

            context.TaskActivityLogs.AddRange(sampleLogs);
            await context.SaveChangesAsync();
        }
    }
}
